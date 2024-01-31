/* eslint-disable no-console */
// This will help us connect to the database
const conn = require('../db/conn');

// This help convert the id from string to ObjectId for the _id.

// Get all users
const getAllUsers = async () => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('users').find({}).toArray();
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Get posts by user
const getUser = async (user) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('users').findOne({ username: user });
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Create a user
const addUser = async (newUser) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('users').insertOne({ avatar: '', ...newUser });
    return result.insertedId;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Update a user
const updateUser = async (user, newDetails) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('users').updateOne(
      { username: user },
      { $set: newDetails },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Delete a user
// TODO: deleting a user should delete all follows and posts info
const deleteUser = async (user) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('users').deleteOne(
      { username: user },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

const hidePost = async (user, postId) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('users').updateOne(
      { username: user },
      { $push: { hidden: postId } },
    );
    return result;
  } catch (err) {
    console.log(`error : ${err.message}`);
    throw err;
  }
};

const unhidePost = async (user, postId) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('users').updateOne(
      { username: user },
      { $pull: { hidden: postId } },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

module.exports = {
  getAllUsers, getUser, addUser, updateUser, deleteUser, hidePost, unhidePost,
};
