const { closeDb } = require("../db");

module.exports = async () => {
  try {
    await closeDb();
  } catch {
    // ignore if never opened
  }
};
