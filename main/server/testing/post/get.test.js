/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { closeMongoDBConnection, connect } = require('../../db/conn');
const app = require('../../server');

let mongo;

describe('DELETE post endpoint integration tests', () => {
  let db;
  let testID;
  let datePosted;
  let res;

  const testPost = {
    user_id: 'testuser',
    description: 'test description',
    fileType: 'image/png',
    mediaURL: 'https://loremflickr.com/640/480?lock=3874144246562816',
    likes: [],
    comments: [],
  };

  beforeAll(async () => {
    token = jwt.sign(
      {
        // eslint-disable-next-line no-underscore-dangle
        _id: '657f7f22451454ff8456481f',
        fullname: 'John Doe',
        username: 'testuser',
        email: 'jdoe@example.com',
        // exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      process.env.JWT_SECRET,
    );
    mongo = await connect();
    db = mongo.db();
    app.set('s3URL', 'https://loremflickr.com/640/480?lock=3874144246562816');
    res = await request(app).post('/post')
      .send({ user_id: 'testuser', description: 'test description', fileType: 'image/png' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`);
    testID = JSON.parse(res.text).data.id;
    datePosted = JSON.parse(res.text).data.datePosted;
  });

  const clearDatabase = async () => {
    try {
      const result = await db.collection('posts').deleteOne({ _id: new ObjectId(testID) });
      const { deletedCount } = result;
      if (deletedCount === 1) {
        console.log('info', 'Successfully deleted test post');
      } else {
        console.log('warning', 'test post was not deleted');
      }
    } catch (err) {
      console.log('error', err.message);
    }
  };

  afterAll(async () => {
    await clearDatabase();
    try {
      await mongo.close();
      await closeMongoDBConnection(); // mongo client that started server.
    } catch (err) {
      return err;
    }
  });

  test('Get all posts endpoint status code and data', async () => {
    const resp = await request(app).get('/posts/');
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const posts = JSON.parse(resp.text).data;
    expect(posts).toContainEqual({ _id: testID, datePosted, ...testPost });
  });

  test('Get all posts by a user endpoint status code and data', async () => {
    const resp = await request(app).get(`/posts/${testPost.user_id}`);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const posts = JSON.parse(resp.text).data;
    expect(posts).toContainEqual({ _id: testID, datePosted, ...testPost });
  });

  test('Get posts by nonexistent user endpoint status code and data', async () => {
    const resp = await request(app).get('/posts/nonexistent');
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const posts = JSON.parse(resp.text).data;
    expect(posts.length).toEqual(0);
  });

  test('Get post by id endpoint status code and data', async () => {
    const resp = await request(app).get(`/post/${testID}`);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const posts = JSON.parse(resp.text).data;
    expect(posts).toEqual({ _id: testID, datePosted, ...testPost });
  });

  test('Get post by id endpoint status code and data: invalid id', async () => {
    const wrongID = new ObjectId();
    const resp = await request(app).get(`/post/${wrongID}`);
    expect(resp.status).toEqual(404);
    expect(resp.type).toBe('application/json');
    const message = JSON.parse(resp.text).error;
    expect(message).toEqual('unknown post id');
  });
});
