/* eslint-disable no-console */
// This will help us connect to the database
const { ObjectId } = require('mongodb');
const conn = require('../db/conn');

// Get all posts
const getAllPosts = async () => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('posts').find({}).toArray();
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Get posts by user
const getPostsByUser = async (user) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('posts').find({ user_id: user }).toArray();
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Get post based on id
const getPost = async (id) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('posts').findOne({ _id: new ObjectId(id) });
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Create new post
const addPost = async (post) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('posts').insertOne(post);
    return result.insertedId;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Add comment to post
const addComment = async (id, comment) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          comments: {
            _id: new ObjectId(),
            content: comment.content,
            user_id: comment.user_id,
          },
        },
      },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Remove comment from post
const removeComment = async (postId, commentId) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $pull: { comments: { _id: new ObjectId(commentId) } } },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Like post
const likePost = async (id, userId) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      { $push: { likes: userId } },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Unlike post
const unlikePost = async (id, userId) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      { $pull: { likes: userId } },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Edit post
const editPost = async (id, post) => {
  try {
    const db = await conn.getDb();
    const result = db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { mediaURL: post.mediaURL, description: post.description, fileType: post.fileType } },
    );
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

// Delete post
const deletePost = async (id) => {
  try {
    const db = await conn.getDb();
    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw err;
  }
};

module.exports = {
  getAllPosts,
  getPostsByUser,
  addPost,
  addComment,
  removeComment,
  likePost,
  unlikePost,
  editPost,
  deletePost,
  getPost,
};
