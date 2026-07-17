const { z } = require("zod");
const {
  createOffboardingTemplateSchema,
  startOffboardingSchema,
} = require("@essethr/shared/schemas/offboarding");
const { idParamSchema } = require("@essethr/shared/schemas/common");

const completeTaskParamsSchema = z.object({
  id: idParamSchema.shape.id,
  taskId: z.coerce.number().int().min(0),
});

module.exports = {
  createOffboardingTemplateSchema,
  startOffboardingSchema,
  completeTaskParamsSchema,
};
