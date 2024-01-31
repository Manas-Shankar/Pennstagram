/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const request = require('supertest');
// const jwt = require('jsonwebtoken');
const { closeMongoDBConnection, connect } = require('../../db/conn');
const app = require('../../server');

let mongo;

describe('lockout endpoint integration tests', () => {
  let db;
  // let token;
  // let testID;

  const testUser = {
    username: 'testuser', fullname: 'John Doe', email: 'jdoe@example.com', password: 'secret',
  };

  beforeAll(async () => {
    mongo = await connect();
    db = mongo.db();
    const res = await request(app).post('/user/')
      .send({
        username: 'testuser', name: 'John Doe', email: 'jdoe@example.com', password: 'secret',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    testID = JSON.parse(res.text).data.id;
    // token = jwt.sign(
    //   {
    //     // eslint-disable-next-line no-underscore-dangle
    //     _id: testID,
    //     fullname: testUser.name,
    //     username: testUser.username,
    //     email: testUser.email,
    //     // exp: Math.floor(Date.now() / 1000) + 60 * 60,
    //   },
    //   'this_is_a_secret',
    // );
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

  afterEach(async () => {
    try {
      const result = await db.collection('lockouts').deleteOne({ user_id: testUser.username });
      const { deletedCount } = result;
      if (deletedCount === 1) {
        console.log('info', 'Successfully deleted test user from lockout');
      } else {
        console.log('warning', 'test user was not deleted from lockout');
      }
    } catch (err) {
      console.log('error', err.message);
    }
  });

  test('Login success first time', async () => {
    const response = await request(app).post('/login')
      .send({ user: testUser });
    expect(response.status).toBe(201);
    expect(response.type).toBe('application/json');
    expect(JSON.parse(response.text).data).toMatchObject(testUser);
  });

  test('Login failure, nonexistent user', async () => {
    const response = await request(app).post('/login')
      .send({ user: { username: 'nonexistent', password: 'secret' } });
    expect(response.status).toBe(401);
    const { message } = JSON.parse(response.text);
    expect(message).toBe('user not found');
  });

  test('Login failure, incorrect password', async () => {
    const response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    expect(response.status).toBe(401);
    const { message } = JSON.parse(response.text);
    expect(message).toBe('incorrect username and password');

    // Check lockout db
    const lockout = await db.collection('lockouts').findOne({ user_id: testUser.username });
    expect(lockout.attempts).toEqual(1);
  });

  test('Login failure, then success', async () => {
    let response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    expect(response.status).toBe(401);
    response = await request(app).post('/login')
      .send({ user: testUser });
    expect(response.status).toBe(201);

    // Check lockout db
    const lockout = await db.collection('lockouts').findOne({ user_id: testUser.username });
    expect(lockout.attempts).toEqual(1);
  });

  test('Login two failures, then success', async () => {
    // attempt 1: failure
    let response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    // attempt 2: failure
    response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    // attempt 3: success
    response = await request(app).post('/login')
      .send({ user: testUser });
    expect(response.status).toBe(201);

    // Check lockout db
    const lockout = await db.collection('lockouts').findOne({ user_id: testUser.username });
    expect(lockout.attempts).toEqual(2);
  });

  test('Login three failures, account locked', async () => {
    // attempt 1: failure
    let response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    // attempt 2: failure
    response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    // attempt 3: failure
    response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    expect(response.status).toBe(429);
    const { message } = JSON.parse(response.text);
    expect(message).toBe('account is locked, try again in 60 seconds');

    // Check lockout db
    const lockout = await db.collection('lockouts').findOne({ user_id: testUser.username });
    expect(lockout.attempts).toEqual(3);
  });

  test('Attempt to login to locked account', async () => {
    // attempt 1: failure
    let response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    // attempt 2: failure
    response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    // attempt 3: failure
    response = await request(app).post('/login')
      .send({ user: { username: testUser.username, password: 'incorrect' } });
    // attempt 4: correct credentials
    response = await request(app).post('/login')
      .send({ user: testUser });
    expect(response.status).toBe(429);
    const { message } = JSON.parse(response.text);
    expect(message).toBe('account is locked, try again in 60 seconds');

    // Check lockout db
    const lockout = await db.collection('lockouts').findOne({ user_id: testUser.username });
    expect(lockout.attempts).toEqual(3);
  });

  test('Unlock account', async () => {
    await db.collection('lockouts').insertOne({
      user_id: testUser.username,
      attempts: 3,
      lockedAt: Date.parse('01 Jan 1970 00:00:00 GMT'),
    });
    const response = await request(app).post('/login')
      .send({ user: testUser });
    expect(response.status).toBe(201);
    expect(response.type).toBe('application/json');
    expect(JSON.parse(response.text).data).toMatchObject(testUser);

    // Check db
    const lockout = await db.collection('lockouts').findOne({ user_id: testUser.username });
    expect(lockout).toBe(null);
  });
});
