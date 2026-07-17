const router = require("express").Router();
const BenefitsDAO = require("./benefitsDAO");
const requirePermission = require("../../middlewares/requirePermission");
const validate = require("../../middlewares/validate");
const { ok, fail } = require("../../lib/apiResponse");
const { PERMISSIONS } = require("../../constants/permissions");
const { z } = require("zod");

const benefitPlanSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  allowanceAmount: z.coerce.number().nonnegative().optional(),
  active: z.boolean().optional(),
});

router.get("/", requirePermission(PERMISSIONS.BENEFITS_READ), async (req, res) => {
  try {
    const plans = await BenefitsDAO.list(req.org);
    return ok(res, { plans });
  } catch {
    return fail(res, "Failed to load benefit plans.", 500);
  }
});

router.post(
  "/",
  requirePermission(PERMISSIONS.BENEFITS_WRITE),
  validate(benefitPlanSchema),
  async (req, res) => {
    try {
      const plan = await BenefitsDAO.create({ ...req.body, org: req.org });
      return ok(res, { plan }, 201);
    } catch {
      return fail(res, "Failed to create benefit plan.", 500);
    }
  },
);

module.exports = router;
