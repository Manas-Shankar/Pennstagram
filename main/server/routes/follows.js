/* eslint-disable no-console */
// This will help us connect to the database
const conn = require('../db/conn');

const getFollowing = async (user) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('follows').findOne({ user_id: user }, { follows: 1 });
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

const getFollowers = async (user) => {
  try {
    const db = await conn.getDb();
    const cursor = await db.collection('follows').find({ follows: user });
    const result = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const doc of cursor) {
      result.push(doc.user_id);
    }
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// user is now following toAdd
const addFollower = async (user, toAdd) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('follows').updateOne(
      { user_id: user },
      { $push: { follows: toAdd } },
      { upsert: true },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// user is no longer following toRemove
const removeFollower = async (user, toRemove) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('follows').updateOne(
      { user_id: user },
      { $pull: { follows: toRemove } },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

module.exports = {
  getFollowing, getFollowers, addFollower, removeFollower,
};
