const EmployeeDAO = require("./employeeDAO");
const { parsePagination, paginated } = require("../../lib/apiResponse");
const { normalizeRoleKey } = require("../../constants/systemRoles");

class EmployeeService {
  static buildListQuery({ user, query = {} }) {
    const { page, pageSize, skip, limit } = parsePagination(query);
    const org = query.org || query.orgId;
    const filter = {
      page,
      limit,
      skip,
      org,
      department: query.department || query.departmentId,
      employees: query.employees
        ? String(query.employees).split(",").filter(Boolean)
        : undefined,
    };

    const role = normalizeRoleKey(user?.role);
    if (role === "SUPERVISOR" && user?.departmentId) {
      filter.department = String(user.departmentId);
    }

    return { filter, page, pageSize };
  }

  static async listEmployees({ user, query }) {
    const { filter, page, pageSize } = EmployeeService.buildListQuery({ user, query });
    const result = await EmployeeDAO.getEmployees(filter);

    if (result?.error) {
      return { error: result.error, server: result.server };
    }

    const employees = Array.isArray(result) ? result : result.items || [];
    const total = Array.isArray(result) ? result.length : result.total ?? employees.length;

    return paginated(employees, { page, pageSize, total });
  }

  static async getEmployeeById(id) {
    return EmployeeDAO.getEmployeeById({ id });
  }

  static async createEmployee(employeeInfo) {
    return EmployeeDAO.createEmployee(employeeInfo);
  }
}

module.exports = EmployeeService;
