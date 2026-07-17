const router = require("express").Router();
const ExpensesDAO = require("./expensesDAO");
const requirePermission = require("../../middlewares/requirePermission");
const validate = require("../../middlewares/validate");
const { ok, fail } = require("../../lib/apiResponse");
const { PERMISSIONS } = require("../../constants/permissions");
const { objectIdSchema } = require("@essethr/shared/schemas/common");
const { z } = require("zod");

const createClaimSchema = z.object({
  employeeId: objectIdSchema,
  amount: z.coerce.number().positive(),
  currency: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "paid"]),
});

router.get("/", requirePermission(PERMISSIONS.EXPENSES_READ), async (req, res) => {
  try {
    const claims = await ExpensesDAO.list(req.org, req.query);
    return ok(res, { claims });
  } catch {
    return fail(res, "Failed to load expense claims.", 500);
  }
});

router.post(
  "/",
  requirePermission(PERMISSIONS.EXPENSES_WRITE),
  validate(createClaimSchema),
  async (req, res) => {
    try {
      const claim = await ExpensesDAO.create({ ...req.body, org: req.org });
      return ok(res, { claim }, 201);
    } catch {
      return fail(res, "Failed to submit claim.", 500);
    }
  },
);

router.patch(
  "/:id/status",
  requirePermission(PERMISSIONS.EXPENSES_WRITE),
  validate(statusSchema),
  async (req, res) => {
    try {
      const claim = await ExpensesDAO.updateStatus(req.org, req.params.id, req.body.status);
      if (!claim) return fail(res, "Claim not found.", 404);
      return ok(res, { claim });
    } catch {
      return fail(res, "Failed to update claim.", 500);
    }
  },
);

module.exports = router;
