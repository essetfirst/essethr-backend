const UserDAO = require("./userDAO");
const UserRepository = require("./user.repository");

function useMongoose() {
  return process.env.USE_MONGOOSE_USERS === "true";
}

class UserService {
  static async getUser(filterQuery = {}) {
    if (useMongoose()) {
      const { accessToken, token, tokens, ...rest } = filterQuery;
      const query = { ...rest };
      if (accessToken || token || tokens) {
        query.tokens = accessToken || token || tokens;
      }
      return UserRepository.findOne(query);
    }
    return UserDAO.getUser(filterQuery);
  }

  static async getUserById(userId) {
    if (useMongoose()) return UserRepository.findById(userId);
    return UserDAO.getUserById(userId);
  }

  static async getUserByEmployeeId(employeeId) {
    if (useMongoose()) return UserRepository.findOne({ employeeId: String(employeeId) });
    return UserDAO.getUserByEmployeeId(employeeId);
  }

  static async getUsers() {
    if (useMongoose()) return UserRepository.findAll();
    return UserDAO.getUsers();
  }

  static async getUsersByOrg(orgId) {
    if (useMongoose()) return UserRepository.findByOrg(orgId);
    return UserDAO.getUsersByOrg(orgId);
  }

  static async createUser(userInfo) {
    if (useMongoose()) return UserRepository.create(userInfo);
    return UserDAO.createUser(userInfo);
  }

  static async updateUser(userInfo) {
    if (useMongoose()) return UserRepository.update(userInfo);
    return UserDAO.updateUser(userInfo);
  }

  static async deleteUser(userId) {
    if (useMongoose()) return UserRepository.deleteById(userId);
    return UserDAO.deleteUser(userId);
  }

  static async checkDuplicateEmailOrPhone(email, phone) {
    if (useMongoose()) return UserRepository.findDuplicate(email, phone);
    return UserDAO.checkDuplicateEmailOrPhone(email, phone);
  }

  static async recordFailedLogin(userId, options) {
    if (useMongoose()) return UserRepository.recordFailedLogin(userId, options);
    return UserDAO.recordFailedLogin(userId, options);
  }

  static async clearLoginFailures(userId, options) {
    if (useMongoose()) return UserRepository.clearLoginFailures(userId, options);
    return UserDAO.clearLoginFailures(userId, options);
  }
}

module.exports = UserService;
