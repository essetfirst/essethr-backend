const mongoose = require("mongoose");
const { mongodbURI, dbName } = require("../config").db;
const logger = require("./logger");

let connected = false;

async function connectMongoose() {
  if (connected) return mongoose.connection;
  await mongoose.connect(mongodbURI, { dbName });
  connected = true;
  logger.info("mongoose.connected", { dbName });
  return mongoose.connection;
}

module.exports = { connectMongoose, mongoose };
