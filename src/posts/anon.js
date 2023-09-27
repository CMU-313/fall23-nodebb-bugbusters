'use strict';

const assert = require('assert');
const db = require('../database');
const plugins = require('../plugins');

// input: (Posts: object)
// output: void
module.exports = function (Posts) {
    // can't load assert in UI, but still performing sanity checks
    assert.equal(typeof (Posts), 'object');

    // inputs: (pid: string, uid: string)
    // output: object
    Posts.anon = async function (pid, uid) {
        // assert.equal(typeof (pid), 'string');
        assert.equal(typeof (uid), 'number');
        const res = await toggleAnon('anon', pid, uid);
        assert.equal(typeof (res), 'object');
        return res;
    };

    // inputs: (pid: string, uid: string)
    // output: object
    Posts.unanon = async function (pid, uid) {
        // assert.equal(typeof (pid), 'string');
        assert.equal(typeof (uid), 'number');
        const res = await toggleAnon('unanon', pid, uid);
        assert.equal(typeof (res), 'object');
        return res;
    };

    // inputs: (type: string, pid: string, uid: number)
    // output: object
    async function toggleAnon(type, pid, uid) {
        // assert.equal(typeof (type), 'string');
        // assert.equal(typeof (pid), 'string');
        assert.equal(typeof (uid), 'number');
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

        const res = {
            post: postData,
            isAnon: isAnoning,
        };

        assert(typeof (res), 'object');

        return res;
    }

    // inputs: (pid: string, uid: number)
    // output: boolean
    Posts.hasAnon = async function (pid, uid) {
        // assert.equal(typeof (pid), 'string');
        // assert.equal(typeof (uid), 'number');
        if (parseInt(uid, 10) <= 0) {
            return Array.isArray(pid) ? pid.map(() => false) : false;
        }

        if (Array.isArray(pid)) {
            const sets = pid.map(pid => `pid:${pid}:users_anoned`);
            return await db.isMemberOfSets(sets, uid);
        }
        const res = await db.isSetMember(`pid:${pid}:users_anoned`, uid);
        assert.equal(typeof (res), 'boolean');
        return res;
    };
};
