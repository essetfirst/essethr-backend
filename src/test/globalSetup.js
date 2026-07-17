const { MongoClient } = require("mongodb");

module.exports = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  try {
    const client = new MongoClient(uri);
    await client.connect();
    await client.db(process.env.MONGODB_DB_NAME || "payrollex_test").command({ ping: 1 });
    await client.close();
    global.__MONGO_AVAILABLE__ = true;
  } catch {
    global.__MONGO_AVAILABLE__ = false;
    console.warn("[jest] MongoDB unavailable — integration tests will be skipped.");
  }
};
