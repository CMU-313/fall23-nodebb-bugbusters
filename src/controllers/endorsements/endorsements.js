// endorsements.js: 
// This module contains the logic for managing endorsements, including interactions with Redis and the Sorted Set. 
// It should export functions that allow you to add endorsements, retrieve endorsements, or perform other related actions

'use strict';

const Redis = require('ioredis');
const redis = new Redis();

const endorsementsKey = 'endorsements';

async function addEndorsement(userId, postId) {
  try {
    const timestamp = Date.now();
    await redis.zadd(endorsementsKey, timestamp, `${userId}:${postId}`);
    return true; // Success
  } catch (error) {
    console.error('Failed to add endorsement:', error);
    return false; // Error
  }
}

module.exports = {
  addEndorsement,
};


// We create a module called endorsements.js.
// We define a function addEndorsement that takes userId and postId as parameters and adds the endorsement to the Redis Sorted Set using the zadd method.
// The function returns true if the endorsement is added successfully and false if there's an error.
