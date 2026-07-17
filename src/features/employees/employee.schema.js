const { z } = require("zod");
const {
  createEmployeeSchema,
  updateEmployeeSchema,
  transferEmployeeSchema,
} = require("@essethr/shared/schemas/employee");
const { paginationQueryBaseSchema, idParamSchema, objectIdSchema } = require("@essethr/shared/schemas/common");

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  transferEmployeeSchema,
  employeeListQuerySchema: paginationQueryBaseSchema.extend({
    org: objectIdSchema.optional().or(z.literal("")),
    department: objectIdSchema.optional().or(z.literal("")),
    position: objectIdSchema.optional().or(z.literal("")),
    employees: z.array(objectIdSchema.optional().or(z.literal(""))).optional(),
  }).transform(({ page, limit, pageSize, ...rest }) => ({
    page,
    limit: pageSize ?? limit,
    ...rest,
  })),
  employeeIdParamSchema: idParamSchema,
};
