const { startDb, closeDb } = require("../db");

let dbReady = false;

beforeAll(async () => {
  try {
    await startDb();
    dbReady = true;
  } catch (err) {
    dbReady = false;
    console.warn("[integration] MongoDB unavailable — skipping integration tests.", err.message);
  }
}, 30000);

afterAll(async () => {
  if (dbReady) {
    try {
      await closeDb();
    } catch {
      // ignore
    }
  }
});

beforeEach(function skipWithoutMongo() {
  if (!dbReady) {
    this.skip();
  }
});
