/**
 * Shared DB bootstrap for integration-style DAO tests.
 */
const { startDb, closeDb } = require("../db");

module.exports = {
  startDb,
  closeDb,
};
