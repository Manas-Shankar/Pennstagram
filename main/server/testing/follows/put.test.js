/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { closeMongoDBConnection, connect } = require('../../db/conn');
const app = require('../../server');

let mongo;

describe('GET follwers/following endpoint integration test', () => {
  let db;
  let res;
  let token;

  const testUser = {
    username: 'testuser1', fullname: 'John Doe', email: 'jdoe@example.com', password: 'secret',
  };
  const testUserToFollow = {
    username: 'testuser2', fullname: 'Jane Doe', email: 'j.doe@example.com', password: 'supersecret',
  };

  beforeAll(async () => {
    token = jwt.sign(
      {
        // eslint-disable-next-line no-underscore-dangle
        _id: '657f7f22451454ff8456481f',
        fullname: testUser.fullname,
        username: testUser.username,
        email: testUser.email,
        // exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      process.env.JWT_SECRET,
    );
    mongo = await connect();
    db = mongo.db();
    res = await request(app).put(`/follows/follow/${testUser.username}`)
      .send({ toAdd: `${testUserToFollow.username}` })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`);
  });

  const clearDatabase = async () => {
    try {
      const result = await db.collection('follows').deleteOne({ user_id: 'testuser1' });
      const { deletedCount } = result;
      if (deletedCount === 1) {
        console.log('info', 'Successfully deleted test user');
      } else {
        console.log('warning', 'test user was not deleted');
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

  test('Add following end point', () => {
    expect(res.status).toEqual(200);
    expect(res.type).toBe('application/json');
  });

  test('User was added to following list', async () => {
    const resp = await db.collection('follows').findOne({ user_id: testUser.username });
    expect(resp.follows).toContainEqual(testUserToFollow.username);
  });

  test('Can unfollow user', async () => {
    const resp = await request(app).put(`/follows/unfollow/${testUser.username}`)
      .send({ toRemove: testUserToFollow.username })
      .set('authorization', `Bearer ${token}`);
    expect(resp.status).toEqual(200);
    expect(res.type).toBe('application/json');

    const followers = await db.collection('follows').find({ follows: testUserToFollow.username });
    const result = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const doc of followers) {
      result.push(doc.user_id);
    }
    expect(result.length).toEqual(0);
  });

  test('Add follower error: no body', async () => {
    const resp = await request(app).put(`/follows/follow/${testUser.username}`)
      .set('authorization', `Bearer ${token}`);
    expect(resp.status).toEqual(404);
    expect(resp.type).toBe('application/json');
    const { message } = JSON.parse(resp.text);
    expect(message).toBe('no user to follow in body');
  });

  test('Remove follower error: no body', async () => {
    const resp = await request(app).put(`/follows/unfollow/${testUser.username}`)
      .set('authorization', `Bearer ${token}`);
    expect(resp.status).toEqual(404);
    expect(resp.type).toBe('application/json');
    const { message } = JSON.parse(resp.text);
    expect(message).toBe('no user to unfollow in body');
  });

  test('Remove follower error: nonexistent', async () => {
    const resp = await request(app).put('/follows/unfollow/nonexistent')
      .send({ toRemove: testUserToFollow.username })
      .set('authorization', `Bearer ${token}`);
    expect(resp.status).toEqual(404);
    expect(resp.type).toBe('application/json');
  });
});
