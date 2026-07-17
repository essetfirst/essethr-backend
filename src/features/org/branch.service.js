const { ObjectId } = require("mongodb");
const getSlug = require("../../utils/getSlug");

let orgs;

class BranchService {
  static injectDB(db) {
    orgs = db.collection("orgs");
  }

  static async getOrgById(orgId) {
    if (!orgId) return null;
    try {
      return await orgs.findOne({ _id: new ObjectId(String(orgId)) });
    } catch {
      return null;
    }
  }

  static resolveCompanySlug(orgDoc) {
    if (!orgDoc) return null;
    return orgDoc.companySlug || orgDoc.slug || getSlug(orgDoc.name || "org");
  }

  static resolveBranchLabel(orgDoc) {
    if (!orgDoc) return "Main";
    return orgDoc.branch || "Main";
  }

  static buildBranchSlug(companySlug, branchLabel, isMainBranch) {
    if (isMainBranch) return companySlug;
    const branchPart = getSlug(branchLabel || "branch");
    return `${companySlug}-${branchPart}`;
  }

  static async getCompanySlugForOrg(orgId) {
    const org = await BranchService.getOrgById(orgId);
    return BranchService.resolveCompanySlug(org);
  }

  static async getBranchesForOrg(orgId) {
    const companySlug = await BranchService.getCompanySlugForOrg(orgId);
    if (!companySlug) return [];

    const list = await orgs
      .find({ companySlug })
      .project({
        slug: 1,
        name: 1,
        branch: 1,
        logo: 1,
        email: 1,
        phone: 1,
        address: 1,
        poBox: 1,
        companySlug: 1,
        isMainBranch: 1,
        createdBy: 1,
      })
      .sort({ isMainBranch: -1, branch: 1 })
      .toArray();

    return list.map((row) => ({
      ...row,
      _id: String(row._id),
    }));
  }

  static async getAccessibleOrgIds(orgId) {
    const branches = await BranchService.getBranchesForOrg(orgId);
    return branches.map((b) => String(b._id));
  }

  static async canAccessOrg(userOrgId, targetOrgId) {
    if (!userOrgId || !targetOrgId) return false;
    if (String(userOrgId) === String(targetOrgId)) return true;
    const accessible = await BranchService.getAccessibleOrgIds(userOrgId);
    return accessible.includes(String(targetOrgId));
  }

  static async assertOrgAccess(userOrgId, targetOrgId) {
    const allowed = await BranchService.canAccessOrg(userOrgId, targetOrgId);
    if (!allowed) {
      const err = new Error("You do not have access to this branch.");
      err.status = 403;
      throw err;
    }
    return true;
  }

  static async prepareBranchCreate(parentOrgId, branchInfo = {}) {
    const parent = await BranchService.getOrgById(parentOrgId);
    if (!parent) {
      return { error: "Parent organization not found." };
    }

    const companySlug = BranchService.resolveCompanySlug(parent);
    const branchLabel = branchInfo.branch || "New Branch";
    const slug = BranchService.buildBranchSlug(companySlug, branchLabel, false);

    const existing = await orgs.findOne({ slug });
    if (existing) {
      return { error: "A branch with this name already exists." };
    }

    return {
      slug,
      name: parent.name,
      companySlug,
      branch: branchLabel,
      isMainBranch: false,
      phone: branchInfo.phone || parent.phone,
      email: branchInfo.email || parent.email,
      poBox: branchInfo.poBox || parent.poBox,
      address: branchInfo.address || parent.address,
      createdBy: branchInfo.createdBy,
      attendancePolicy: parent.attendancePolicy,
    };
  }

  static async prepareCompanyCreate(orgInfo = {}) {
    const name = orgInfo.name;
    const branchLabel = orgInfo.branch || "Main";
    const companySlug = orgInfo.companySlug || getSlug(name);
    const slug = BranchService.buildBranchSlug(companySlug, branchLabel, true);

    return {
      ...orgInfo,
      slug,
      name,
      companySlug,
      branch: branchLabel,
      isMainBranch: orgInfo.isMainBranch !== false,
    };
  }
}

module.exports = BranchService;
