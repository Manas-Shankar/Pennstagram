/* eslint-disable no-console */
const conn = require('../db/conn');

const lockoutPeriod = 10 * 6000;

const addTime = (date) => new Date(date.getTime() + lockoutPeriod);

// return true if account locked, false otherwise
const checkLocked = async (user) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('lockouts').findOne({ user_id: user });
    if (result === undefined || result === null) {
      // account not in lockouts
      return false;
    }
    const currentTime = new Date();
    if (result.lockedAt !== null && currentTime < addTime(new Date(result.lockedAt))) {
      // account is locked, return true
      const obj = {
        locked: true,
        timeLeft: Math.ceil(
          (addTime(new Date(result.lockedAt)).getTime() - currentTime.getTime()) / 1000,
        ),
      };
      return obj;
    }
    if (result.lockedAt !== null) {
      // acount was locked, but no longer is
      await db.collection('lockouts').deleteOne({ user_id: user });
    }
    // account was not locked
    return false;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// returns number of attempts left
const updateLockout = async (user) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('lockouts').findOne({ user_id: user });
    if (result === undefined || result === null) {
      // user hasn't been added to lockouts before
      const newLockout = {
        user_id: user,
        attempts: 1,
        lockedAt: null,
      };
      await db.collection('lockouts').insertOne(newLockout);
      return 2;
    }
    if (result.attempts + 1 === 3) {
      // third attempt, lock the account
      await db.collection('lockouts').updateOne(
        { user_id: user },
        { $set: { lockedAt: new Date(), attempts: result.attempts + 1 } },
      );
      return 0;
    }
    // second attempt, increment counter
    db.collection('lockouts').updateOne(
      { user_id: user },
      { $set: { attempts: result.attempts + 1 } },
    );
    return 1;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

module.exports = { checkLocked, updateLockout };
