const chalk = require("chalk");
const { ObjectID } = require("mongodb");

let positions;

/**
 * @typedef PositionInfo Object representation of a position data
 * @property {String} slug A unique representation of the title
 * @property {String} title The official title of the position
 * @property {String} level The level of position hierarchy (e.g senior, junior or I II)
 * @property {String} manager The manager for which position holder responds to in the hierarchy
 * @property {Number} salary The salary for position
 * @property {Array<Object>} allowances The list of allowances associated with position
 * @property {Array<Object>} deductions The list of allowances associated with position
 * @property {String} department The department to which this position belongs
 * @property {String} org The organization this position belongs to
 *
 */

class PositionDAO {
  static async injectDB(db) {
    try {
      positions = db.collection("positions");
      await positions.createIndex({ slug: 1 });
    } catch (e) {
      console.error(
        chalk.redBright(`Error creating handle for PositionDAO, ${e}`)
      );
    }
  }

  static async getPositions(filterCriteria = {}) {
    try {
      const { org, department, ...rest } = filterCriteria;
      // console.log(filterCriteria)
      let query = {
        org: org ? String(org) : { $exists: true },
        department: department ? ObjectID(department) : { $exists: true },
        ...rest,
      };
      return await positions.find(query).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Error fetching positions, ${e}`));
      return { error: e };
    }
  }

  static async getPositionById(positionId) {
    try {
      let query = { _id: ObjectID(positionId) };
      return await positions.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error fetching position by id, ${e}`));
      return { error: e };
    }
  }

  static async createPosition(positionInfo) {
    try {
      const { title, ...rest } = positionInfo;
      return await positions.insertOne({
        title,
        slug: title
          .split()
          .map((part) => part.toLowerCase())
          .join("-"),
        ...rest,
      });
    } catch (e) {
      console.error(chalk.redBright(`Error creating new position, ${e}`));
      return { error: e };
    }
  }

  static async updatePosition(positionInfo = {}) {
    try {
      const { _id, ...rest } = positionInfo;
      let query = { _id: ObjectID(_id) };
      let update = { $set: { ...rest } };
      return await positions.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Error updating position by id, ${e}`));
      return { error: e };
    }
  }

  static async deletePosition(positionId) {
    try {
      let query = { _id: ObjectID(positionId) };
      return await positions.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Error deleting position by id, ${e}`));
      return { error: e };
    }
  }

  static async deleteAllPositions() {
    try {
      return await positions.deleteAll();
    } catch (e) {
      console.error(chalk.redBright(`Error deleting all positions, ${e}`));
      return { error: e };
    }
  }
}

module.exports = PositionDAO;
