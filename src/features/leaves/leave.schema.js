const {
  createLeaveSchema,
  approveLeavesSchema,
  rejectLeavesSchema,
} = require("@essethr/shared/schemas/leave");
const { idParamSchema } = require("@essethr/shared/schemas/common");

module.exports = {
  createLeaveSchema,
  approveLeavesSchema,
  rejectLeavesSchema,
  leaveIdParamSchema: idParamSchema,
};
