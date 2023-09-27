
'use strict';
const assert = require('assert');
const async = require('async');
const validator = require('validator');
const _ = require('lodash');

const db = require('../database');
const meta = require('../meta');
const user = require('../user');
const categories = require('../categories');
const plugins = require('../plugins');
const utils = require('../utils');
const batch = require('../batch');
const cache = require('../cache');

module.exports = function (Topics) {
    Topics.createTags = async function (tags, uid, tid, timestamp) {
        if (!Array.isArray(tags) || !tags.length) {
            // console.log('Not Array??');
            return;
        }
        // console.log('Topics.createTags: tags, uid, tid, timestamp', tags, uid, tid, timestamp);
        const accounttype = await user.getUserField(uid, 'accounttype');
        // console.log('accounttype:', accounttype);
        if (typeof accounttype === 'undefined') {
            // console.log('The user is a guest');
        }
        if (uid !== 0) {
            // console.log('Username: ', user.getUserField(uid, 'username'));
        }
        const isAdmin = await user.isAdministrator(uid);
        assert(typeof isAdmin === 'boolean', 'isAdmin must be a boolean');
        assert((typeof accounttype === 'string' || typeof accounttype === 'undefined'), 'accounttype must be string or undefined');
        const allTags = await getAllTags();
        assert(typeof allTags === 'object', 'allTags must be an array object');
        // console.log('printing all tags:', allTags);

        let isExistingTag = true;
        assert(typeof isExistingTag === 'boolean', 'isExistingTag is a boolean');
        for (let i = 0; i < tags.length; i++) {
            let tagVal = tags[i];
            assert(typeof tagVal === 'string', 'tagVal must be a string');
            isExistingTag = false;
            for (let j = 0; j < allTags.length; j++) {
                let allTagVal = allTags[j].value;
                assert(typeof allTagVal === 'string', 'allTagVal must be a string');
                // console.log('tag val:', tagVal);
                // console.log('allTag val:', allTagVal);
                if (tagVal === allTagVal) {
                    isExistingTag = true;
                }
            }
            if (!isExistingTag) { break; }
        }

        try {
            // When non-admin student tries to create new tags
            if ((accounttype === 'student') && !isExistingTag && !isAdmin) {
                // console.log('reaching here?');
                throw new Error('You are not authorized to create new tags!');
            }   
            const cid = await Topics.getTopicField(tid, 'cid');
            const topicSets = tags.map(tag => `tag:${tag}:topics`).concat(
                tags.map(tag => `cid:${cid}:tag:${tag}:topics`)
            );
            // console.log('New topic with this tag can be posted.');
            await db.sortedSetsAdd(topicSets, timestamp, tid);
            await Topics.updateCategoryTagsCount([cid], tags);
            await Promise.all(tags.map(updateTagCount));
        } catch (error) {
            // console.error('Unauthorized Tag Creation was stopped');
            throw new Error('As a student you are not authorized to create new tags');
        }
        //this function return nothing
    };

    Topics.filterTags = async function (tags, cid) {
        const result = await plugins.hooks.fire('filter:tags.filter', { tags: tags, cid: cid });
        tags = _.uniq(result.tags)
            .map(tag => utils.cleanUpTag(tag, meta.config.maximumTagLength))
            .filter(tag => tag && tag.length >= (meta.config.minimumTagLength || 3));

        return await filterCategoryTags(tags, cid);
    };

    Topics.updateCategoryTagsCount = async function (cids, tags) {
        await Promise.all(cids.map(async (cid) => {
            const counts = await db.sortedSetsCard(
                tags.map(tag => `cid:${cid}:tag:${tag}:topics`)
            );
            const tagToCount = _.zipObject(tags, counts);
            const set = `cid:${cid}:tags`;

            const bulkAdd = tags.filter(tag => tagToCount[tag] > 0)
                .map(tag => [set, tagToCount[tag], tag]);

            const bulkRemove = tags.filter(tag => tagToCount[tag] <= 0)
                .map(tag => [set, tag]);

            await Promise.all([
                db.sortedSetAddBulk(bulkAdd),
                db.sortedSetRemoveBulk(bulkRemove),
            ]);
        }));

        await db.sortedSetsRemoveRangeByScore(
            cids.map(cid => `cid:${cid}:tags`), '-inf', 0
        );
    };

    Topics.validateTags = async function (tags, cid, uid, tid = null) {
        if (!Array.isArray(tags)) {
            throw new Error('[[error:invalid-data]]');
        }
        tags = _.uniq(tags);
        const [categoryData, isPrivileged, currentTags] = await Promise.all([
            categories.getCategoryFields(cid, ['minTags', 'maxTags']),
            user.isPrivileged(uid),
            tid ? Topics.getTopicTags(tid) : [],
        ]);
        if (tags.length < parseInt(categoryData.minTags, 10)) {
            throw new Error(`[[error:not-enough-tags, ${categoryData.minTags}]]`);
        } else if (tags.length > parseInt(categoryData.maxTags, 10)) {
            throw new Error(`[[error:too-many-tags, ${categoryData.maxTags}]]`);
        }

        const addedTags = tags.filter(tag => !currentTags.includes(tag));
        const removedTags = currentTags.filter(tag => !tags.includes(tag));
        const systemTags = (meta.config.systemTags || '').split(',');

        if (!isPrivileged && systemTags.length &&
            addedTags.length && addedTags.some(tag => systemTags.includes(tag))) {
            throw new Error('[[error:cant-use-system-tag]]');
        }

        if (!isPrivileged && systemTags.length &&
            removedTags.length && removedTags.some(tag => systemTags.includes(tag))) {
            throw new Error('[[error:cant-remove-system-tag]]');
        }
    };

    async function filterCategoryTags(tags, cid) {
        const tagWhitelist = await categories.getTagWhitelist([cid]);
        if (!Array.isArray(tagWhitelist[0]) || !tagWhitelist[0].length) {
            return tags;
        }
        const whitelistSet = new Set(tagWhitelist[0]);
        return tags.filter(tag => whitelistSet.has(tag));
    }

    Topics.createEmptyTag = async function (tag) {
        if (!tag) {
            throw new Error('[[error:invalid-tag]]');
        }
        if (tag.length < (meta.config.minimumTagLength || 3)) {
            throw new Error('[[error:tag-too-short]]');
        }
        const isMember = await db.isSortedSetMember('tags:topic:count', tag);
        if (!isMember) {
            await db.sortedSetAdd('tags:topic:count', 0, tag);
            cache.del('tags:topic:count');
        }
        const allCids = await categories.getAllCidsFromSet('categories:cid');
        const isMembers = await db.isMemberOfSortedSets(
            allCids.map(cid => `cid:${cid}:tags`), tag
        );
        const bulkAdd = allCids.filter((cid, index) => !isMembers[index])
            .map(cid => ([`cid:${cid}:tags`, 0, tag]));
        await db.sortedSetAddBulk(bulkAdd);
    };

    Topics.renameTags = async function (data) {
        for (const tagData of data) {
            // eslint-disable-next-line no-await-in-loop
            await renameTag(tagData.value, tagData.newName);
        }
    };

    async function renameTag(tag, newTagName) {
        if (!newTagName || tag === newTagName) {
            return;
        }
        newTagName = utils.cleanUpTag(newTagName, meta.config.maximumTagLength);

        await Topics.createEmptyTag(newTagName);
        const allCids = {};

        await batch.processSortedSet(`tag:${tag}:topics`, async (tids) => {
            const topicData = await Topics.getTopicsFields(tids, ['tid', 'cid', 'tags']);
            const cids = topicData.map(t => t.cid);
            topicData.forEach((t) => { allCids[t.cid] = true; });
            const scores = await db.sortedSetScores(`tag:${tag}:topics`, tids);
            // update tag:<tag>:topics
            await db.sortedSetAdd(`tag:${newTagName}:topics`, scores, tids);
            await db.sortedSetRemove(`tag:${tag}:topics`, tids);

            // update cid:<cid>:tag:<tag>:topics
            await db.sortedSetAddBulk(topicData.map(
                (t, index) => [`cid:${t.cid}:tag:${newTagName}:topics`, scores[index], t.tid]
            ));
            await db.sortedSetRemove(cids.map(cid => `cid:${cid}:tag:${tag}:topics`), tids);

            // update 'tags' field in topic hash
            topicData.forEach((topic) => {
                topic.tags = topic.tags.map(tagItem => tagItem.value);
                const index = topic.tags.indexOf(tag);
                if (index !== -1) {
                    topic.tags.splice(index, 1, newTagName);
                }
            });
            await db.setObjectBulk(
                topicData.map(t => [`topic:${t.tid}`, { tags: t.tags.join(',') }]),
            );
        }, {});
        await Topics.deleteTag(tag);
        await updateTagCount(newTagName);
        await Topics.updateCategoryTagsCount(Object.keys(allCids), [newTagName]);
    }

    async function updateTagCount(tag) {
        const count = await Topics.getTagTopicCount(tag);
        await db.sortedSetAdd('tags:topic:count', count || 0, tag);
        cache.del('tags:topic:count');
    }

    Topics.getTagTids = async function (tag, start, stop) {
        const tids = await db.getSortedSetRevRange(`tag:${tag}:topics`, start, stop);
        const payload = await plugins.hooks.fire('filter:topics.getTagTids', { tag, start, stop, tids });
        return payload.tids;
    };

    Topics.getTagTidsByCids = async function (tag, cids, start, stop) {
        const keys = cids.map(cid => `cid:${cid}:tag:${tag}:topics`);
        const tids = await db.getSortedSetRevRange(keys, start, stop);
        const payload = await plugins.hooks.fire('filter:topics.getTagTidsByCids', { tag, cids, start, stop, tids });
        return payload.tids;
    };

    Topics.getTagTopicCount = async function (tag, cids = []) {
        let count = 0;
        if (cids.length) {
            count = await db.sortedSetsCardSum(
                cids.map(cid => `cid:${cid}:tag:${tag}:topics`)
            );
        } else {
            count = await db.sortedSetCard(`tag:${tag}:topics`);
        }

        const payload = await plugins.hooks.fire('filter:topics.getTagTopicCount', { tag, count, cids });
        return payload.count;
    };

    Topics.deleteTags = async function (tags) {
        if (!Array.isArray(tags) || !tags.length) {
            return;
        }
        await removeTagsFromTopics(tags);
        const keys = tags.map(tag => `tag:${tag}:topics`);
        await db.deleteAll(keys);
        await db.sortedSetRemove('tags:topic:count', tags);
        cache.del('tags:topic:count');
        const cids = await categories.getAllCidsFromSet('categories:cid');

        await db.sortedSetRemove(cids.map(cid => `cid:${cid}:tags`), tags);

        const deleteKeys = [];
        tags.forEach((tag) => {
            deleteKeys.push(`tag:${tag}`);
            cids.forEach((cid) => {
                deleteKeys.push(`cid:${cid}:tag:${tag}:topics`);
            });
        });
        await db.deleteAll(deleteKeys);
    };

    async function removeTagsFromTopics(tags) {
        await async.eachLimit(tags, 50, async (tag) => {
            const tids = await db.getSortedSetRange(`tag:${tag}:topics`, 0, -1);
            if (!tids.length) {
                return;
            }

            await db.deleteObjectFields(
                tids.map(tid => `topic:${tid}`),
                ['tags'],
            );
        });
    }

    Topics.deleteTag = async function (tag) {
        await Topics.deleteTags([tag]);
    };

    Topics.getTags = async function (start, stop) {
        return await getFromSet('tags:topic:count', start, stop);
    };

    Topics.getCategoryTags = async function (cids, start, stop) {
        if (Array.isArray(cids)) {
            return await db.getSortedSetRevUnion({
                sets: cids.map(cid => `cid:${cid}:tags`),
                start,
                stop,
            });
        }
        return await db.getSortedSetRevRange(`cid:${cids}:tags`, start, stop);
    };

    Topics.getCategoryTagsData = async function (cids, start, stop) {
        return await getFromSet(
            Array.isArray(cids) ? cids.map(cid => `cid:${cid}:tags`) : `cid:${cids}:tags`,
            start,
            stop
        );
    };

    async function getFromSet(set, start, stop) {
        let tags;
        if (Array.isArray(set)) {
            tags = await db.getSortedSetRevUnion({
                sets: set,
                start,
                stop,
                withScores: true,
            });
        } else {
            tags = await db.getSortedSetRevRangeWithScores(set, start, stop);
        }

        const payload = await plugins.hooks.fire('filter:tags.getAll', {
            tags: tags,
        });
        return await Topics.getTagData(payload.tags);
    }

    Topics.getTagData = async function (tags) {
        if (!tags.length) {
            return [];
        }
        tags.forEach((tag) => {
            tag.valueEscaped = validator.escape(String(tag.value));
            tag.valueEncoded = encodeURIComponent(tag.valueEscaped);
            tag.class = tag.valueEscaped.replace(/\s/g, '-');
        });
        return tags;
    };

    Topics.getTopicTags = async function (tid) {
        const data = await Topics.getTopicsTags([tid]);
        return data && data[0];
    };

    Topics.getTopicsTags = async function (tids) {
        const topicTagData = await Topics.getTopicsFields(tids, ['tags']);
        return tids.map((tid, i) => topicTagData[i].tags.map(tagData => tagData.value));
    };

    Topics.getTopicTagsObjects = async function (tid) {
        const data = await Topics.getTopicsTagsObjects([tid]);
        return Array.isArray(data) && data.length ? data[0] : [];
    };

    Topics.getTopicsTagsObjects = async function (tids) {
        const topicTags = await Topics.getTopicsTags(tids);
        const uniqueTopicTags = _.uniq(_.flatten(topicTags));

        const tags = uniqueTopicTags.map(tag => ({ value: tag }));
        const tagData = await Topics.getTagData(tags);
        const tagDataMap = _.zipObject(uniqueTopicTags, tagData);

        topicTags.forEach((tags, index) => {
            if (Array.isArray(tags)) {
                topicTags[index] = tags.map(tag => tagDataMap[tag]);
            }
        });

        return topicTags;
    };

    Topics.addTags = async function (tags, tids) {
        const topicData = await Topics.getTopicsFields(tids, ['tid', 'cid', 'timestamp', 'tags']);
        const bulkAdd = [];
        const bulkSet = [];
        topicData.forEach((t) => {
            const topicTags = t.tags.map(tagItem => tagItem.value);
            tags.forEach((tag) => {
                bulkAdd.push([`tag:${tag}:topics`, t.timestamp, t.tid]);
                bulkAdd.push([`cid:${t.cid}:tag:${tag}:topics`, t.timestamp, t.tid]);
                if (!topicTags.includes(tag)) {
                    topicTags.push(tag);
                }
            });
            bulkSet.push([`topic:${t.tid}`, { tags: topicTags.join(',') }]);
        });
        await Promise.all([
            db.sortedSetAddBulk(bulkAdd),
            db.setObjectBulk(bulkSet),
        ]);

        await Promise.all(tags.map(updateTagCount));
        await Topics.updateCategoryTagsCount(_.uniq(topicData.map(t => t.cid)), tags);
    };

    Topics.removeTags = async function (tags, tids) {
        const topicData = await Topics.getTopicsFields(tids, ['tid', 'cid', 'tags']);
        const bulkRemove = [];
        const bulkSet = [];

        topicData.forEach((t) => {
            const topicTags = t.tags.map(tagItem => tagItem.value);
            tags.forEach((tag) => {
                bulkRemove.push([`tag:${tag}:topics`, t.tid]);
                bulkRemove.push([`cid:${t.cid}:tag:${tag}:topics`, t.tid]);
                if (topicTags.includes(tag)) {
                    topicTags.splice(topicTags.indexOf(tag), 1);
                }
            });
            bulkSet.push([`topic:${t.tid}`, { tags: topicTags.join(',') }]);
        });
        await Promise.all([
            db.sortedSetRemoveBulk(bulkRemove),
            db.setObjectBulk(bulkSet),
        ]);

        await Promise.all(tags.map(updateTagCount));
        await Topics.updateCategoryTagsCount(_.uniq(topicData.map(t => t.cid)), tags);
    };

    Topics.updateTopicTags = async function (tid, tags) {
        await Topics.deleteTopicTags(tid);
        const cid = await Topics.getTopicField(tid, 'cid');

        tags = await Topics.filterTags(tags, cid);
        await Topics.addTags(tags, [tid]);
    };

    Topics.deleteTopicTags = async function (tid) {
        const topicData = await Topics.getTopicFields(tid, ['cid', 'tags']);
        const { cid } = topicData;
        const tags = topicData.tags.map(tagItem => tagItem.value);
        await db.deleteObjectField(`topic:${tid}`, 'tags');

        const sets = tags.map(tag => `tag:${tag}:topics`)
            .concat(tags.map(tag => `cid:${cid}:tag:${tag}:topics`));
        await db.sortedSetsRemove(sets, tid);

        await Topics.updateCategoryTagsCount([cid], tags);
        await Promise.all(tags.map(updateTagCount));
    };

    Topics.searchTags = async function (data) {
        if (!data || !data.query) {
            return [];
        }
        let result;
        if (plugins.hooks.hasListeners('filter:topics.searchTags')) {
            result = await plugins.hooks.fire('filter:topics.searchTags', { data: data });
        } else {
            result = await findMatches(data);
        }
        result = await plugins.hooks.fire('filter:tags.search', { data: data, matches: result.matches });
        return result.matches;
    };

    Topics.autocompleteTags = async function (data) {
        if (!data || !data.query) {
            return [];
        }
        let result;
        if (plugins.hooks.hasListeners('filter:topics.autocompleteTags')) {
            result = await plugins.hooks.fire('filter:topics.autocompleteTags', { data: data });
        } else {
            result = await findMatches(data);
        }
        return result.matches;
    };

    async function getAllTags() {
        const cached = cache.get('tags:topic:count');
        if (cached !== undefined) {
            return cached;
        }
        const tags = await db.getSortedSetRevRangeWithScores('tags:topic:count', 0, -1);
        cache.set('tags:topic:count', tags);
        return tags;
    }

    async function findMatches(data) {
        let { query } = data;
        let tagWhitelist = [];
        if (parseInt(data.cid, 10)) {
            tagWhitelist = await categories.getTagWhitelist([data.cid]);
        }
        let tags = [];
        if (Array.isArray(tagWhitelist[0]) && tagWhitelist[0].length) {
            const scores = await db.sortedSetScores(`cid:${data.cid}:tags`, tagWhitelist[0]);
            tags = tagWhitelist[0].map((tag, index) => ({ value: tag, score: scores[index] }));
        } else if (data.cids) {
            tags = await db.getSortedSetRevUnion({
                sets: data.cids.map(cid => `cid:${cid}:tags`),
                start: 0,
                stop: -1,
                withScores: true,
            });
        } else {
            tags = await getAllTags();
        }

        query = query.toLowerCase();

        const matches = [];
        for (let i = 0; i < tags.length; i += 1) {
            if (tags[i].value && tags[i].value.toLowerCase().startsWith(query)) {
                matches.push(tags[i]);
                if (matches.length > 39) {
                    break;
                }
            }
        }

        matches.sort((a, b) => {
            if (a.value < b.value) {
                return -1;
            } else if (a.value > b.value) {
                return 1;
            }
            return 0;
        });
        return { matches: matches };
    }

    Topics.searchAndLoadTags = async function (data) {
        const searchResult = {
            tags: [],
            matchCount: 0,
            pageCount: 1,
        };

        if (!data || !data.query || !data.query.length) {
            return searchResult;
        }
        const tags = await Topics.searchTags(data);

        const tagData = await Topics.getTagData(tags.map(tag => ({ value: tag.value })));

        tagData.forEach((tag, index) => {
            tag.score = tags[index].score;
        });
        tagData.sort((a, b) => b.score - a.score);
        searchResult.tags = tagData;
        searchResult.matchCount = tagData.length;
        searchResult.pageCount = 1;
        return searchResult;
    };

    Topics.getRelatedTopics = async function (topicData, uid) {
        if (plugins.hooks.hasListeners('filter:topic.getRelatedTopics')) {
            const result = await plugins.hooks.fire('filter:topic.getRelatedTopics', { topic: topicData, uid: uid, topics: [] });
            return result.topics;
        }

        let maximumTopics = meta.config.maximumRelatedTopics;
        if (maximumTopics === 0 || !topicData.tags || !topicData.tags.length) {
            return [];
        }

        maximumTopics = maximumTopics || 5;
        let tids = await Promise.all(topicData.tags.map(tag => Topics.getTagTids(tag.value, 0, 5)));
        tids = _.shuffle(_.uniq(_.flatten(tids))).slice(0, maximumTopics);
        const topics = await Topics.getTopics(tids, uid);
        return topics.filter(t => t && !t.deleted && parseInt(t.uid, 10) !== parseInt(uid, 10));
    };
};
