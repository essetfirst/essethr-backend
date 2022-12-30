const PayrollDateDAO = require("./payrollDateDAO");
const { ObjectID, ObjectId } = require("mongodb");
let holidays;

/**
 * @typedef HolidayInfo an object representation of a holiday
 * @property {Array<ObjectId>} employees the employees permitted for holiday
 * @property {Number} length The length of holiday in days
 * @property {Date} fromDate The start date of holiday
 * @property {Date} toDate The end date of holiday
 */
class HolidayDAO {
  static async injectDB(db) {
    try {
      holidays = await db.collection("holidays");
    } catch (e) {
      console.error(`Unable to establish handle for HolidayDAO, ${e}`);
    }
  }


  static async getHolidays(filter = {}) {
    try {
      const { org, ...rest } = filter;
      let query = { ...rest };
       
      if (org) {
        query["org"] = String(org);
      }
      return await holidays.find(query).toArray();
    } catch (e) {
      console.error(`Error fetching holidays, ${e}`);
      return { error: e };
    }
  }

  static async getHolidayById(holidayId) {
    try {
      let query = { _id: ObjectID(holidayId) };
      return await holidays.findOne(query);
    } catch (e) {
      console.error(`Error fetching holiday by id, ${e}`);
      return { error: e };
    }
  }

  /**
   * Adds a holiday to the database.
   * @param {HolidayInfo} holidayInfo
   */
  static async addHoliday(holidayInfo) {
    try {
      // let holidayList = [];
      // holidayList.push(holidayInfo);

      // // Add holiday hours to payroll dates
      // let dates = [];
      // holidayList.forEach(({ employees, duration, fromDate, toDate }) => {
      //   employees.forEach((employeeId) => {
      //     // TODO: compute holiday hours
      //     let date = new Date(
      //       new Date(fromDate).getTime() + duration * 24 * 3600000
      //     );
      //     let holidayHours = 0;
      //     dates.push({ employeeId, date, holidayHours });
      //   });
      // });
      // await PayrollDateDAO.addDates(dates);

      return await holidays.insertOne(holidayInfo);
    } catch (e) {
      console.error(`Unable to register holiday, ${e}`);
      return { error: e };
    }
  }

  static async updateHolidaay({ _id, ...rest }) {
    try {
      const query = { _id: ObjectID(_id) };
      const update = { $set: { ...rest } };
      return await holidays.updateOne(query, update);
    } catch (e) {
      console.error(`Error occurred while updating holiday record, ${e}`);
      return { error: e, server: true };
    }
  }

  static async deleteHoliday({ _id, ...rest }) {
    try {
      const query = { _id: ObjectID(_id), ...rest };
      return await holidays.deleteOne(query);
    } catch (e) {
      console.error(`Error occurred while deleting holiday record, ${e}`);
      return { error: e, server: true };
    }
  }

  static async deleteAllHolidays() {
    try {
      return await holidays.deleteMany();
    } catch (e) {
      console.error(`Error occurred while deleting all holiday records, ${e}`);
      return { error: e, server: true };
    }
  }
}

module.exports = HolidayDAO;
