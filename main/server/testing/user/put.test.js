/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
const { closeMongoDBConnection, connect } = require('../../db/conn');
const app = require('../../server');

let mongo;

describe('PUT user endpoint integration tests', () => {
  let db;

  const testUser = {
    username: 'testuser', fullname: 'JohnDoe', email: 'jdoe@example.com', password: 'secret',
  };

  beforeAll(async () => {
    mongo = await connect();
    db = mongo.db();
    const res = await request(app).post('/user/')
      .send({
        username: 'testuser', name: 'JohnDoe', email: 'jdoe@example.com', password: 'secret',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    testID = JSON.parse(res.text).data.id;
  });

  const clearDatabase = async () => {
    try {
      const result = await db.collection('users').deleteOne({ username: 'testuser' });
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

  test('Update user endpoint and status code', async () => {
    res = await request(app).put(`/user/${testUser.username}`)
      .send({ newDetails: { fullname: 'Jane Doe' } });
    expect(res.status).toEqual(200);
    expect(res.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('users').findOne({ username: testUser.username });
    expect(updatedUser.fullname).toEqual('Jane Doe');
  });

  test('Update nonexistent user', async () => {
    res = await request(app).put('/user/nonexistent')
      .send({ newDetails: { fullname: 'Jane Doe' } });
    expect(res.status).toEqual(404);
    expect(res.type).toBe('application/json');
    const { message } = JSON.parse(res.text);
    expect(message).toBe('nonexistent not found');
  });

  test('Update user missing details', async () => {
    res = await request(app).put(`/user/${testUser.username}`)
      .send({});
    expect(res.status).toEqual(404);
    expect(res.type).toBe('application/json');
    const { message } = JSON.parse(res.text);
    expect(message).toBe('no update information in body');
  });
});
