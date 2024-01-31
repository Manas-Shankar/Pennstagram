/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
const { closeMongoDBConnection, connect } = require('../../db/conn');
const app = require('../../server');

let mongo;

describe('DELETE user endpoint integration test', () => {
  let db;
  let testID;
  let res;

  const testUser = {
    username: 'testuser', fullname: 'John Doe', email: 'jdoe@example.com', password: 'secret',
  };

  beforeAll(async () => {
    mongo = await connect();
    db = mongo.db();
    res = await request(app).post('/user/')
      .send({
        username: 'testuser', name: 'John Doe', email: 'jdoe@example.com', password: 'secret',
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

  test('Delete endpoint and status code', async () => {
    const resp = await request(app).delete(`/user/${testUser.username}`);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const resp1 = await db.collection('users').findOne({ _id: testID });
    expect(resp1).toBeNull();
  });

  test('Delete no user', async () => {
    const resp = await request(app).delete('/user/nonexistent');
    expect(resp.status).toEqual(404);
    expect(resp.type).toBe('application/json');
    const { message } = JSON.parse(resp.text);
    expect(message).toBe('nonexistent not found');
  });
});
