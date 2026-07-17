const BranchService = require("../features/org/branch.service");

/**
 * Resolves active branch context from X-Organization when the user may access it.
 * Falls back to the user's home org from JWT.
 */
const resolveOrgContext = async (req, res, next) => {
  try {
    const homeOrg = String(req.user?.org || "");
    req.homeOrg = homeOrg;

    const headerOrg = req.headers["x-organization"];
    if (headerOrg && String(headerOrg) !== homeOrg) {
      const allowed = await BranchService.canAccessOrg(homeOrg, String(headerOrg));
      if (!allowed) {
        return res.status(403).json({
          success: false,
          error: "You do not have access to the selected branch.",
        });
      }
      req.org = String(headerOrg);
    } else if (homeOrg) {
      req.org = homeOrg;
    }

    next();
  } catch (e) {
    console.error("resolveOrgContext error", e);
    return res.status(500).json({ success: false, error: "Branch context error." });
  }
};

module.exports = resolveOrgContext;
