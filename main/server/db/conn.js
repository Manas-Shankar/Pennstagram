/* eslint-disable no-console */
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../config.env' });

const dbURL = process.env.ATLAS_URI;
let MongoConnection;
let db;

const connect = async () => {
  try {
    MongoConnection = (await MongoClient.connect(
      dbURL,
      { useNewUrlParser: true, useUnifiedTopology: true },
    ));
    db = MongoConnection.db();
    console.log(`connected to db: ${db.databaseName}`);
    return MongoConnection;
  } catch (err) {
    console.log(err.message);
    return null;
  }
};

const getDb = async () => {
  if (!db) {
    await connect();
  }
  return db;
};

const closeMongoDBConnection = async () => {
  await MongoConnection.close();
};

module.exports = {
  connect, getDb, closeMongoDBConnection,
};
