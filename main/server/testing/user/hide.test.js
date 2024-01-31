/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
const { closeMongoDBConnection, connect } = require('../../db/conn');
const app = require('../../server');

let mongo;

describe('hide/unhide user endpoint integration tests', () => {
  let db;
  let testID;

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

  test('Hide post from user endpoint and status code', async () => {
    const res = await request(app).put(`/user/${testUser.username}/hide/${testID}`)
      .send({});
    expect(res.status).toEqual(200);
    expect(res.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('users').findOne({ username: testUser.username });
    expect(updatedUser.hidden).toContainEqual(testID);
  });

  test('Hide post from nonexistent user', async () => {
    const res = await request(app).put(`/user/nonexistent/hide/${testID}`)
      .send({});
    expect(res.status).toEqual(404);
    expect(res.type).toBe('application/json');
    const { message } = JSON.parse(res.text);
    expect(message).toBe('nonexistent not found');
  });

  test('Unhide post from user endpoint and status code', async () => {
    // hide the post
    let res = await request(app).put(`/user/${testUser.username}/hide/${testID}`)
      .send({});

    // unhide the post
    res = await request(app).put(`/user/${testUser.username}/unhide/${testID}`)
      .send({});
    expect(res.status).toEqual(200);
    expect(res.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('users').findOne({ username: testUser.username });
    expect(updatedUser.hidden).not.toContainEqual(testID);
  });

  test('Unhide post from nonexistent user', async () => {
    const res = await request(app).put(`/user/nonexistent/unhide/${testID}`)
      .send({});
    expect(res.status).toEqual(404);
    expect(res.type).toBe('application/json');
    const { message } = JSON.parse(res.text);
    expect(message).toBe('nonexistent not found');
  });
});
