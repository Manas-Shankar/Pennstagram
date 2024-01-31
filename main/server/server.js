/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: './config.env' });

// JWT
const jwt = require('jsonwebtoken');

// Express app creation
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// S3 Creation
const fs = require('fs');
const formidable = require('formidable');
const s3 = require('./s3Operations');

// Database connection
const conn = require('./db/conn');
// Database libs
const posts = require('./routes/post');
const users = require('./routes/user');
const follows = require('./routes/follows');
const lockouts = require('./routes/lockout');

const port = process.env.PORT || 8080;
app.listen(port, async () => {
  // perform a database connection when server starts
  await conn.connect();
  console.log(`Server is running on port: ${port}`);
});

// Root end-point
app.get('/', (_req, resp) => {
  resp.json({ message: 'welcome to our backend' });
});

// new post, new comment, or follower update
let updates = '';
app.get('/update', (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    // eslint-disable-next-line no-unused-vars
    jwt.verify(token, process.env.JWT_SECRET, async (err, _decoded) => {
      if (err) {
        // console.log(`Error: ${err}`);
        res.status(401).json({ message: err });
        return;
      }
      res.status(200).json({ message: updates });
      // console.log(updates);
    });
  }
  // updates = '';
});

/**
 * Post related end-points
 */

// READ all posts
// returns array of posts
app.get('/posts', async (_req, res) => {
  try {
    const results = await posts.getAllPosts();
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// READ posts by user
// returns array of posts
app.get('/posts/:user', async (req, res) => {
  try {
    const results = await posts.getPostsByUser(req.params.user);
    if (results === undefined) {
      res.status(404).json({ error: 'unknown user' });
      return;
    }
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// READ post by id
// return post matching id
app.get('/post/:id', async (req, res) => {
  try {
    const results = await posts.getPost(req.params.id);
    if (results === undefined || results === null) {
      res.status(404).json({ error: 'unknown post id' });
      return;
    }
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// UPLOAD file to AWS s3 bucket and save URL
app.post('/upload', async (req, res) => {
  // console.log('upload a file');
  const form = new formidable.IncomingForm(); // { multiples: true });
  form.parse(req, (err, fields, files) => {
    // console.log('file_0 path', files.File_0[0].mimetype);
    if (err) {
      // console.log('error', err.message);
      res.status(404).json({ error: err.message });
    }
    let cacheBuffer = Buffer.alloc(0);
    const fStream = fs.createReadStream(files.File_0[0].filepath);
    fStream.on('data', (chunk) => {
      cacheBuffer = Buffer.concat([cacheBuffer, chunk]);
    });

    fStream.on('end', async () => {
      const s3URL = await s3.uploadFile(cacheBuffer, files.File_0[0].newFilename);
      // console.log('end', cacheBuffer.length);
      app.set('s3URL', s3URL);
      res.status(201).json({ s3URL });
    });
  });
});

// CREATE new post by user
// request body: { description: "some text", mediaURL: "some url", user_id: "username of poster"}
// returns newly created post with its id
app.post('/post', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(`Error: ${err}`);
        res.status(401).json({ message: 'user not authenticated / jwt expired !' });
      } else {
        if (!req.body.description && !req.body.user_id) {
          res.status(404).json({ message: 'missing user, description' });
          return;
        }
        try {
          const mediaURL = app.get('s3URL');
          const newPost = {
            user_id: req.body.user_id,
            description: req.body.description,
            mediaURL,
            fileType: req.body.fileType,
            datePosted: new Date(),
            likes: [],
            comments: [],
          };
          const result = await posts.addPost(newPost);
          res.status(201).json({ data: { id: result, ...newPost } });
          updates = 'new post';
          app.set('s3URL', undefined);
        } catch (e) {
          console.log(e);
          res.status(409).json({ message: 'there was an error' });
        }
      }
    });
  }
});
// UPDATE post with a new comment
// id - post id
// request body: comment: { content: "some text", user_id: "username of poster"}
// returns result message
app.put('/post/:id/comment', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(`Error: ${err}`);
        res.status(401).json({ message: 'user not authenticated / jwt expired !' });
      } else {
        try {
          if (!req.body.comment.content || !req.body.comment.user_id) {
            res.status(404).json({ message: 'missing comment content or user_id' });
            return;
          }
          delete req.body.comment.token;
          const result = await posts.addComment(req.params.id, req.body.comment);
          if (result.matchedCount === 0 || result.modifiedCount === 0) {
            res.status(404).json({ message: `post ${req.params.id} not found` });
            return;
          }
          updates = 'new comment';
          res.status(200).json({ message: result });
        } catch (e) {
          res.status(404).json({ message: 'there was an error' });
        }
      }
    });
  }
});

// UPDATE post removing a comment
// post_id - post id
// comment_id - comment id
// request body: user_id (username of the person unliking)
// returns result message
app.put('/post/:post_id/comment/:comment_id', async (req, res) => {
  try {
    const result = await posts.removeComment(req.params.post_id, req.params.comment_id);
    if (result.matchedCount === 0 || result.modifiedCount === 0) {
      res.status(404).json({ message: `post ${req.params.post_id} not found` });
      return;
    }
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// UPDATE post adding a like
// id - post id
// request body: user_id (username of the person liking)
// returns result message
app.put('/post/:id/like', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(`Error: ${err}`);
        res.status(401).json({ message: 'user not authenticated / jwt expired !' });
      } else {
        if (!req.body.user_id) {
          res.status(404).json({ message: 'missing user_id' });
          return;
        }
        try {
          const result = await posts.likePost(req.params.id, req.body.user_id);
          if (result.matchedCount === 0 || result.modifiedCount === 0) {
            res.status(404).json({ message: `${req.params.id} not found` });
            return;
          }
          res.status(200).json({ message: result });
        } catch (e) {
          res.status(404).json({ message: 'there was an error' });
        }
      }
    });
  }
});

// UPDATE post removing a like
// id - post id
// request body: user_id (username of the person unliking)
// returns result message
app.put('/post/:id/unlike', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(`Error: ${err}`);
        res.status(401).json({ message: 'user not authenticated / jwt expired !' });
      } else {
        if (!req.body.user_id) {
          res.status(404).json({ message: 'missing user_id' });
          return;
        }
        try {
          const result = await posts.unlikePost(req.params.id, req.body.user_id);
          if (result.matchedCount === 0 || result.modifiedCount === 0) {
            res.status(404).json({ message: `${req.params.id} not found` });
            return;
          }
          res.status(200).json({ message: result });
        } catch (e) {
          res.status(404).json({ message: 'there was an error' });
        }
      }
    });
  }
});

// UPDATE post general (edit description, edit media)
// id - post id
// request body: post object
// returns result message
// currently sending mediaURL from frontend as a File object if uploaded,
// else null, need to handle and convert to string before
//  uploading to mongo as URL
app.put('/post/:id', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(`Error: ${err}`);
        res.status(401).json({ message: 'user not authenticated / jwt expired !' });
      } else {
        if (!req.body.post) {
          res.status(404).json({ message: 'missing description or media to update' });
          return;
        }
        try {
          const mediaURL = app.get('s3URL');
          console.log('uploaded url:', mediaURL);
          console.log('from body:', req.body.post.mediaURL);
          if (mediaURL !== undefined && req.body.post.mediaURL?.length === 0) {
            req.body.post.mediaURL = mediaURL;
          }
          delete req.body.post.token;
          console.log(req.body.post);
          const result = await posts.editPost(req.params.id, req.body.post);
          if (result.matchedCount === 0 || result.modifiedCount === 0) {
            res.status(404).json({ message: `post ${req.params.id} not found` });
            return;
          }
          res.status(200).json({ message: result });
          app.set('s3URL', undefined);
        } catch (e) {
          res.status(404).json({ message: 'there was an error' });
        }
      }
    });
  }
});

// DELETE post
// id - post id
// returns result message
app.delete('/post/:id', async (req, res) => {
  try {
    const result = await posts.deletePost(req.params.id);
    if (result.deletedCount === 0) {
      res.status(404).json({ message: `post ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

/**
 * User related end-points
 */

// READ all users
app.get('/users', async (_req, res) => {
  try {
    const results = await users.getAllUsers();
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// READ user by username
// user - username/user_id
// returns user
app.get('/user/:user', async (req, res) => {
  try {
    const results = await users.getUser(req.params.user);
    if (results === undefined || results === null) {
      res.status(404).json({ error: 'unknown user' });
      return;
    }
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// CREATE new user
// returns newly created user plus its new id (NOT the same as user_id/username)
app.post('/user/', async (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.username) {
    res.status(404).json({ message: 'missing name, email, username, or password' });
    return;
  }
  try {
    const newUser = {
      username: req.body.username,
      fullname: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    const result = await users.addUser(newUser);
    res.status(201).json({ data: { id: result, ...newUser } });
  } catch (err) {
    res.status(409).json({ message: 'there was an error' });
  }
});

// UPDATE by username
// user - username/user_id
// request body: newDetails: { username: ..., password: ..., email: ..., fullname: ...}
// basically, newDetails can contain any subset of info to update about the user
// returns result message
app.put('/user/:user', async (req, res) => {
  if (!req.body.newDetails) {
    // body has no information
    res.status(404).json({ message: 'no update information in body' });
    return;
  }
  try {
    const result = await users.updateUser(req.params.user, req.body.newDetails);
    if (result.matchedCount === 0) {
      res.status(404).json({ message: `${req.params.user} not found` });
      return;
    }
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// DELETE user
// user - username/user_id
// returns result message
app.delete('/user/:user', async (req, res) => {
  try {
    const result = await users.deleteUser(req.params.user);
    if (result.deletedCount === 0) {
      res.status(404).json({ message: `${req.params.user} not found` });
      return;
    }
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// Login
// request body: user: { username: "username", password: "password"}
app.post('/login', async (req, res) => {
  try {
    // check if the user exists
    console.log(req.headers);
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          console.log(`Error: ${err}`);
          res.status(401).json({ message: err });
          return;
        }
        console.log(decoded);
        const results = await users.getUser(decoded.username);
        res.status(201).json({ data: results });
      });
    } else {
      const results = await users.getUser(req.body.user.username);
      if (results === undefined || results === null) {
        res.status(401).json({ message: 'user not found' });
        return;
      }
      // check if the account is locked
      const locked = await lockouts.checkLocked(req.body.user.username);
      if (locked.locked) {
        // account is locked
        res.status(429).json({ message: `account is locked, try again in ${locked.timeLeft} seconds` });
        return;
      }
      // check password
      if (results.password === req.body.user.password) {
        const token = jwt.sign(
          {
            // eslint-disable-next-line no-underscore-dangle
            _id: results._id,
            fullname: results.firstName,
            username: results.username,
            email: results.email,
            // exp: Math.floor(Date.now() / 1000) + 60 * 60,
          },
          process.env.JWT_SECRET,
          { expiresIn: 180 },
        );
        res.status(201).json({ data: results, token });
      } else {
        const attemptsLeft = await lockouts.updateLockout(req.body.user.username);
        if (attemptsLeft === 0) {
          res.status(429).json({ message: 'account is locked, try again in 60 seconds' });
        } else {
          res.status(401).json({ message: 'incorrect username and password', attempts: attemptsLeft });
        }
      }
    }
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// Hide post
app.put('/user/:user/hide/:post', async (req, res) => {
  try {
    const result = await users.hidePost(req.params.user, req.params.post);
    if (result.matchedCount === 0) {
      res.status(404).json({ message: `${req.params.user} not found` });
      return;
    }
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// Unhide post
app.put('/user/:user/unhide/:post', async (req, res) => {
  try {
    const result = await users.unhidePost(req.params.user, req.params.post);
    if (result.matchedCount === 0) {
      res.status(404).json({ message: `${req.params.user} not found` });
      return;
    }
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

/**
 * Follower related end-points
 */

// READ who the user follows
// user - username/user_id of the user you want the following list of
app.get('/follows/:user', async (req, res) => {
  try {
    const results = await follows.getFollowing(req.params.user);
    if (results === undefined || results === null) {
      res.status(404).json({ message: 'unknown user' });
      return;
    }
    res.status(200).json({ data: results.follows });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// READ who follows the user
// user - username/user_id of the user you want the followers list of
app.get('/follows/following/:user', async (req, res) => {
  try {
    const results = await follows.getFollowers(req.params.user);
    if (results === undefined || results === null) {
      res.status(404).json({ message: 'unknown user' });
      return;
    }
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was an error' });
  }
});

// UPDATE add new user to user's following list
// user: the user who is following someone new
// request body: toAdd: "username/user_id"
// toAdd gets added to user's following list
app.put('/follows/follow/:user', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(`Error: ${err}`);
        res.status(401).json({ message: 'user not authenticated / jwt expired !' });
      } else {
        if (!req.body.toAdd) {
          res.status(404).json({ message: 'no user to follow in body' });
          return;
        }
        try {
          const result = await follows.addFollower(req.params.user, req.body.toAdd);
          if (result.matchedCount === 0 && result.upsertedId === undefined) {
            res.status(404).json({ message: `${req.params.user} not found` });
            return;
          }
          // user_id gained a follower
          updates = 'follower update';
          res.status(200).json({ message: result });
        } catch (e) {
          res.status(404).json({ message: 'there was an error' });
        }
      }
    });
  }
});

// UPDATE remove user from user's following list
// user: the user who is unfollowing someone
// request body: toRemove: "username/user_id"
// toRemove gets removed from user's following list
app.put('/follows/unfollow/:user', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(`Error: ${err}`);
        res.status(401).json({ message: 'user not authenticated / jwt expired !' });
      } else {
        if (!req.body.toRemove) {
          res.status(404).json({ message: 'no user to unfollow in body' });
          return;
        }
        try {
          const result = await follows.removeFollower(req.params.user, req.body.toRemove);
          if (result.matchedCount === 0) {
            res.status(404).json({ message: `${req.params.user} not found` });
            return;
          }
          // user_id lost a follower
          updates = 'follower update';
          res.status(200).json({ message: result });
        } catch (e) {
          res.status(404).json({ message: 'there was an error' });
        }
      }
    });
  }
});

/**
 * Default catch all end-point
 */
app.use((_req, resp) => {
  resp.status(404).json({ error: 'invalid endpoint' });
});

module.exports = app;
