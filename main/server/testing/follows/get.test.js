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
    await request(app).put(`/follows/follow/${testUser.username}`)
      .send({ toAdd: `${testUserToFollow.username}` })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`);
  });

  const clearDatabase = async () => {
    try {
      let result = await db.collection('follows').deleteOne({ user_id: 'testuser1' });
      let { deletedCount } = result;
      if (deletedCount === 1) {
        console.log('info', 'Successfully deleted test user');
      } else {
        console.log('warning', 'test user was not deleted');
      }
      result = await db.collection('users').deleteOne({ username: 'testuser1' });
      ({ deletedCount } = result);
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

  test('Get followers end-point and status code', async () => {
    const resp = await request(app).get(`/follows/following/${testUserToFollow.username}`);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const followers = JSON.parse(resp.text).data;
    expect(followers).toContainEqual(testUser.username);
  });

  test('Get following end-point and status code', async () => {
    const resp = await request(app).get(`/follows/${testUser.username}`);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const following = JSON.parse(resp.text).data;
    expect(following).toContainEqual(testUserToFollow.username);
  });

  test('Get followers error', async () => {
    const resp = await request(app).get('/follows/following/');
    expect(resp.status).toEqual(404);
    expect(resp.type).toBe('application/json');
    const { message } = JSON.parse(resp.text);
    expect(message).toBe('unknown user');
  });

  test('Get following error', async () => {
    const resp = await request(app).get('/follows/nonexistent');
    expect(resp.status).toEqual(404);
    expect(resp.type).toBe('application/json');
    const { message } = JSON.parse(resp.text);
    expect(message).toBe('unknown user');
  });
});
