/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
const { closeMongoDBConnection, connect } = require('../../db/conn');
const app = require('../../server');

let mongo;

describe('GET user(s) endpoint integration test', () => {
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

  test('The status code is 201 and response type', () => {
    expect(res.status).toBe(201); // status code
    expect(res.type).toBe('application/json');
  });

  test('The new user is returned', () => {
    expect(JSON.parse(res.text).data).toMatchObject({ id: testID, ...testUser });
  });

  test('The new user is in the database', async () => {
    const user = await db.collection('users').findOne({ username: testUser.username });
    expect(user.fullname).toEqual(testUser.fullname);
  });

  test('Missing information in request body', async () => {
    const response = await request(app).post('/user/')
      .send({});
    expect(response.status).toBe(404);
    expect(response.type).toBe('application/json');
    const { message } = JSON.parse(response.text);
    expect(message).toBe('missing name, email, username, or password');
  });
});
