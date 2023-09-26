'use strict';

const db = require('../database');
const plugins = require('../plugins');

module.exports = function (Posts) {
    Posts.anon = async function (pid, uid) {
        return await toggleAnon('anon', pid, uid);
    };

    Posts.unanon = async function (pid, uid) {
        return await toggleAnon('unanon', pid, uid);
    };

    async function toggleAnon(type, pid, uid) {
        if (parseInt(uid, 10) <= 0) {
            throw new Error('[[error:not-logged-in]]');
        }

        const isAnoning = type === 'anon';

        const [postData, hasAnon] = await Promise.all([
            Posts.getPostFields(pid, ['pid', 'uid']),
            Posts.hasAnon(pid, uid),
        ]);

        if (isAnoning && hasAnon) {
            throw new Error('[[error:already-anon]]');
        }

        if (!isAnoning && !hasAnon) {
            throw new Error('[[error:already-not-anon]]');
        }

        await db[isAnoning ? 'setAdd' : 'setRemove'](`pid:${pid}:users_anoned`, uid);
        await Posts.setPostField(pid, 'anon', isAnoning);

        plugins.hooks.fire(`action:post.${type}`, {
            pid: pid,
            uid: uid,
            owner: postData.uid,
            current: hasAnon ? 'anon' : 'unanon',
        });

        return {
            post: postData,
            isAnon: isAnoning,
        };
    }

    Posts.hasAnon = async function (pid, uid) {
        if (parseInt(uid, 10) <= 0) {
            return Array.isArray(pid) ? pid.map(() => false) : false;
        }

        if (Array.isArray(pid)) {
            const sets = pid.map(pid => `pid:${pid}:users_anoned`);
            return await db.isMemberOfSets(sets, uid);
        }
        return await db.isSetMember(`pid:${pid}:users_anoned`, uid);
    };
};
