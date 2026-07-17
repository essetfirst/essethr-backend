const { ObjectID, ObjectId } = require("mongodb");
// const { all } = require("../routes/employee.route");
const { LeaveAllowanceDAO } = require("../leaves/leaveDAO");

let employees;
let dbRef;

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function safeObjectId(value) {
  if (!value) return null;
  try {
    return new ObjectId(String(value));
  } catch {
    return null;
  }
}

function employeeIdFilter(empIdStr, id) {
  return {
    $or: [{ employeeId: empIdStr }, { employeeId: id }],
  };
}

function normalizeLeaveRow(leave) {
  if (!leave) return leave;
  return {
    ...leave,
    _id: String(leave._id),
    fromDate: toDateInput(leave.fromDate || leave.startDate || leave.from),
    toDate: toDateInput(leave.toDate || leave.endDate || leave.to),
  };
}

/**
 * @typedef AllowanceInfo
 * @property {String} description
 * @property {Boolean} taxable
 * @property {number} amount
 *
 */

/**
 * @typedef PositionInfo
 * @property {String} title
 * @property {String} department
 * @property {String} assignee
 * @property {String} manager
 *
 */

/**
 * @typedef AddressInfo
 * @property {String} state
 * @property {String} city
 * @property {String} subcity
 * @property {String} woreda
 * @property {String} kebele
 * @property {String} street
 *
 */

/**
 * @typedef ContactInfo
 * @property {String} phone
 * @property {String} mobile
 * @property {String} email
 * @property {String} poBox
 */

/**
 * @typedef JobInfo represents
 * @property {Date} effectiveDate
 * @property {String} location
 * @property {String} division
 * @property {String} department
 * @property {String} jobTitle
 *
 */

/**
 * @typedef CompensationInfo
 * @property {Date} effectiveDate
 * @property {Number} salary
 * @property {String} payType
 * @property {Number} paySchedule
 * @property {String} reason
 * @property {String} comment
 * @property {Array<AllowanceInfo>} allowances
 * @property {Array<DeductionInfo>} deductions
 * @property {String} taxCode
 * @property {Number} taxRate
 * @property {Boolean} pension
 * @property {Number} pensionRate
 *
 */

/**
 * @typedef PersonalInfo
 * @property {String} firstName
 * @property {String} surName
 * @property {String} lastName
 * @property {String} gender
 * @property {Date} birthDate
 * @property {String} nationalID
 * @property {String} licenseNumber
 * @property {String} passportNumber
 * @property {String} maritalStatus
 * @property {Array<AddressInfo>} addresses
 * @property {Array<ContactInfo>} contacts
 * @property {Array<String>} emails
 *
 */

/**
 * @typedef EmployeeInfo
 * @property {PersonalInfo} personal
 * @property {EmploymentInfo} employement
 * @property {Array<EmploymentInfo>} employementHistory
 * @property {JobInfo} job
 * @property {Array<JobInfo>} jobHistory
 * @property {CompensationInfo} compensation
 * @property {Array<CompensationInfo>} compensationHistory
 * @property {BonusInfo} bonus
 * @property {Array<BonusInfo>} bonusHistory
 * @property {CommissionInfo} commission
 * @property {Array<BonusInfo>} commissionHistory
 * @property {Array<DocumentInfo>} documents
 */

// class UpdatePersonalDetails {
//   constructor({ employeesCollection }) {
//     this.collection = employeesCollection;
//   }

//   async exec(employeeId, personalInfoUpdate) {
//     const query = {};
//     const update = {};
//     const result = await this.collection.updateOne(query, update);
//     return { success: true };
//   }
// }

// class UpdateEmploymentDetailsDAO {}
// class UpdateJobDetailsDAO {}
// class UpdateCompensationDetailsDAO {}
// class UpdateBonusDetailsDAO {}
// class UpdateCommisionDetailsDAO {}

class EmployeeDAO {
  static async injectDB(db) {
    try {
      dbRef = db;
      employees = await db.collection("employees", {
        $validator: {
          $jsonSchema: {},
        },
      });

      await employees.createIndex({ employeeId: 1 });
    } catch (e) {
      console.error(`Unable to establish handle for EmployeeDAO, ${e} `);
      return { error: e };
    }
  }

  /**
   *
   * @param employeeInfo EmployeeInfo
   *
   *
   */
  static async createEmployee(employeeInfo) {
    try {
      // Save employee to database
      const employee = await employees.insertOne(employeeInfo);
      // console.log(employeeInfo);

      // Allocate/Accrue leave entitlement/allowance to new employee
      await LeaveAllowanceDAO.allocateAllowance({
        employeeId: employee.insertedId,
      });

      return employee;
    } catch (e) {
      console.error(`Unable to create new employee record, ${e}`);
      return { error: e };
    }
  }

  /**
   *
   * @param filterCriteria Page Limit
   *
   */
  static async getEmployees(filterCriteria = {}) {
    try {
      const { org, page, limit, department, departmentId } = filterCriteria;
      let query = {};
      console.log(filterCriteria);
      if (org) {
        query["org"] = String(org);
      }
      if (department || departmentId) {
        query.department = String(department || departmentId);
      }

      const aEmployees = filterCriteria.employees;
      query =
        aEmployees && Array.isArray(aEmployees) && aEmployees.length >= 1
          ? { _id: { $in: aEmployees } }
          : query;

      console.log("\nQuery: \n", query);
      let findPipeline = employees.find(query);
      // console.log(findPipeline);
      if (limit) {
        findPipeline = findPipeline.limit(limit);
      }

      if (page && limit) {
        findPipeline = findPipeline.skip((page > 0 ? page - 1 : 0) * limit);
      }
      const [items, total] = await Promise.all([
        findPipeline.toArray(),
        employees.countDocuments(query),
      ]);
      return { items, total };
    } catch (e) {
      console.error(`Unable to fetch employee records, ${e}`);
      return { error: e };
    }
  }

  static async getEmployee(query) {
    try {
      return await employees.findOne(query);
    } catch (e) {
      console.error(`Unable to fetch employee by id, ${e}`);
      return { error: e };
    }
  }

  static async getEmployeeById(employeeId ) {
    try {
      const { id }= employeeId
      const query = { _id: new ObjectId(id) };
      console.log(id,employeeId)
      return await employees.findOne(query);
    } catch (e) {
      console.error(`Unable to fetch employee by id, ${e}`);
      return { error: e };
    }
  }

  static async getEmployeeDetailsById(employeeId) {
    try {
      const id = safeObjectId(employeeId);
      if (!id) return { error: "Invalid employee id" };

      const emp = await employees.findOne({ _id: id });
      if (!emp) return { error: "Employee not found" };

      const empIdStr = String(emp._id);
      const db = dbRef || employees.db;

      const [
        attendance,
        leaves,
        leaveAllowance,
        payslips,
        departmentDetails,
        positionDetails,
      ] = await Promise.all([
        db
          .collection("attendances")
          .find(employeeIdFilter(empIdStr, id))
          .sort({ date: -1 })
          .limit(500)
          .toArray(),
        db
          .collection("leaves")
          .find(employeeIdFilter(empIdStr, id))
          .sort({ startDate: -1, createdOn: -1 })
          .toArray(),
        db.collection("leave_allowances").find(employeeIdFilter(empIdStr, id)).toArray(),
        db
          .collection("payslips")
          .find(employeeIdFilter(empIdStr, id))
          .sort({ payDate: -1 })
          .toArray(),
        safeObjectId(emp.department)
          ? db.collection("departments").findOne({ _id: safeObjectId(emp.department) })
          : null,
        safeObjectId(emp.position)
          ? db.collection("positions").findOne({ _id: safeObjectId(emp.position) })
          : null,
      ]);

      return [
        {
          ...emp,
          _id: empIdStr,
          department: emp.department ? String(emp.department) : "",
          position: emp.position ? String(emp.position) : "",
          hireDate: toDateInput(emp.hireDate),
          startDate: toDateInput(emp.startDate),
          endDate: toDateInput(emp.endDate),
          birthDay: toDateInput(emp.birthDay || emp.dateOfBirth),
          attendance: (attendance || []).map((row) => ({
            ...row,
            _id: String(row._id),
            date: toDateInput(row.date),
          })),
          leaves: (leaves || []).map(normalizeLeaveRow),
          leaveAllowance: leaveAllowance || [],
          payslips: (payslips || []).map((p) => ({
            ...p,
            _id: String(p._id),
            payDate: toDateInput(p.payDate),
            fromDate: toDateInput(p.fromDate),
            toDate: toDateInput(p.toDate),
            employeeName: `${emp.firstName || ""} ${emp.surName || emp.lastName || ""}`.trim(),
          })),
          departmentDetails: departmentDetails || null,
          positionDetails: positionDetails || null,
        },
      ];
    } catch (e) {
      console.error(`Unable to fetch employee details by id, ${e}`);
      return { error: e };
    }
  }

  static async uploadEmployeeImage(employeeInfo = {}) {
    try {
      const { _id, image } = employeeInfo;
      console.log(image);
      let query = { _id: new ObjectId(_id) };
      let update = { $set: { image } };
      return await employees.updateOne(query, update);
    } catch (e) {
      console.error(`Unable to update single employee record, ${e}`);
      return { error: e };
    }
  }

  static async updateEmployee(employeeInfo = {}) {
    try {
      const { _id, ...rest } = employeeInfo;
      console.log(employeeInfo);
      let query = { _id: new ObjectId(_id) };
      let update = { $set: { ...rest } };
      return await employees.updateOne(query, update);
    } catch (e) {
      console.error(`Unable to update single employee record, ${e}`);
      return { error: e };
    }
  }

  static async transferEmployee({
    _id,
    org,
    department,
    position,
    jobHistoryEntry,
  }) {
    try {
      const query = { _id: new ObjectId(_id) };
      const update = {
        $set: {
          org: String(org),
          department: String(department),
          position: String(position),
        },
        $push: { jobHistory: jobHistoryEntry },
      };
      return await employees.updateOne(query, update);
    } catch (e) {
      console.error(`Unable to transfer employee, ${e}`);
      return { error: e, server: true };
    }
  }

  static async deleteEmployee(employeeId) {
    try {
      return await employees.deleteOne({ _id: new ObjectId(employeeId) });
    } catch (e) {
      console.error(`Unable to delete single employee record, ${e}`);
      return { error: e };
    }
  }

  static async deleteAllEmployees() {
    try {
      return await employees.deleteMany();
    } catch (e) {
      console.error(`Unable to delete all employee records, ${e}`);
      return { error: e };
    }
  }

  static async getReport({ department, fromDate, toDate, from, to }) {
    try {
      let query = {
        startDate: {
          $gte: new Date(fromDate || from).toISOString().slice(0, 10),
          $lte: new Date(toDate || to).toISOString().slice(0, 10),
        },
      };
      const employeeList = await employees.find(query).toArray();

      const getAgeRange = (age) => {
        if (age < 20) {
          return `< 20`;
        } else if (age >= 20 && age <= 30) {
          return `20 - 30`;
        } else if (age > 30 && age <= 45) {
          return `31 - 45`;
        } else if (age > 45 && age <= 65) {
          return `46 - 65`;
        } else {
          return `> 65`;
        }
      };

      const getExperienceRange = (experience) => {
        if (experience <= 5) {
          return `0 - 5`;
        } else if (experience > 5 && experience <= 10) {
          return `6 - 10`;
        } else if (experience > 11 && experience <= 20) {
          return `11 - 20`;
        } else if (experience > 20 && experience <= 25) {
          return `21 - 25`;
        } else {
          return `> 25`;
        }
      };

      let reportResult = {
        employees: [],
        byDepartment: {},
        byGender: {
          Male: 0,
          Female: 0,
        },
        byAge: {
          "< 20": 0,
          "20 - 30": 0,
          "31 - 45": 0,
          "46 - 65": 0,
          "> 65": 0,
        },
        byExperience: {
          "0 - 5": 0,
          "6 - 10": 0,
          "11 - 20": 0,
          "21 - 25": 0,
          "> 25": 0,
        },
      };

      console.log("Employees found: ", employeeList);
      employeeList.forEach(
        ({
          department,
          gender,
          birthDay,
          hireDate,
          firstName,
          surName,
          lastName,
        }) => {
          const name = `${firstName} ${surName} ${lastName}`;
          const age =
            new Date().getFullYear() - new Date(birthDay).getFullYear();
          const experience =
            new Date().getFullYear() - new Date(hireDate).getFullYear();
          reportResult.employees.push({
            name,
            gender,
            age,
            department,
            experience,
          });
          reportResult.byDepartment[department] = reportResult.byDepartment[
            department
          ]
            ? reportResult.byDepartment[department] + 1
            : 1;
          reportResult.byAge[getAgeRange(age)] = reportResult.byAge[
            getAgeRange(age)
          ]
            ? reportResult.byAge[getAgeRange(age)] + 1
            : 1;
          reportResult.byGender[gender] = reportResult.byGender[gender]
            ? reportResult.byGender[gender] + 1
            : 1;
          reportResult.byExperience[getExperienceRange(experience)] =
            reportResult.byExperience[getExperienceRange(experience)]
              ? reportResult.byExperience[getExperienceRange(experience)] + 1
              : 1;
        }
      );

      return reportResult;
    } catch (e) {
      console.error(`Unable to fetch employee report, ${e}`);
      return { error: e };
    }
  }

  static async searchEmployee(employeeInfo) {
    try {
      //   const query = employeeInfo;
      console.log(employeeInfo);
      const data = await employees.findOne(employeeInfo);
      console.log("MOl");
      // console.log(JSON.stringify(data));
      return data;
    } catch (e) {
      console.error(`Unable to fetch employee by id, ${e}`);
      return { error: e };
    }
  }

  static async filterEmployee(employeeInfo) {
    try {
      let {
        department,
        gender,
        position,
        minSalary,
        maxSalary,
        minAge,
        maxAge,
        org,
      } = employeeInfo;
      console.log(minAge, maxAge);
      const today = new Date().toJSON().slice(0, 10);
      const minus = +today.split("-")[0] - minAge;
      const plus = +today.split("-")[0] - maxAge;
      // console.log(today.split("-"),today,minus,plus)
      var birthDate;
      var salary;
      if (minSalary) {
        salary = { $gte: minSalary };
      }
      if (maxSalary) {
        salary = { $lte: maxSalary };
      }
      if (minSalary && maxSalary) {
        salary = { $gte: minSalary, $lte: maxSalary };
      }
      if (minAge) {
        birthDate = {
          $lte: new Date(`${minus}-01-01`).toISOString().split("T")[0],
        };
      }
      if (maxAge) {
        birthDate = {
          $gte: new Date(`${plus}-01-01`).toISOString().split("T")[0],
        };
      }
      if (maxAge && minAge) {
        birthDate = {
          $lte: new Date(`${minus}-12-30`).toISOString().split("T")[0],
          $gte: new Date(`${plus}-01-01`).toISOString().split("T")[0],
        };
      }

      const query = {
        org: String(org),
        gender:
          (gender && gender == "all") || gender == undefined
            ? { $exists: true }
            : gender,
        department:
          (department && department == "all") || department == undefined
            ? { $exists: true }
            : department,
        position:
          (position && position == "all") || position == undefined
            ? { $exists: true }
            : position,
        birthDay: birthDate,
        // salary,
      };
      console.log(query);
      return await employees.find(query).toArray();
    } catch (e) {
      console.error(`Unable to fetch employee by id, ${e}`);
      return { error: e };
    }
  }
}

module.exports = EmployeeDAO;
