const DEFAULT_SETTINGS = Object.freeze({
  payroll: {
    currency: "USD",
    payDay: 25,
    taxRate: 0,
    overtimeMultiplier: 1.5,
    lockAfterDays: 7,
  },
  leave: {
    requireApproval: true,
    maxCarryOverDays: 5,
    allowNegativeBalance: false,
  },
  attendance: {
    gracePeriodMinutes: 15,
    autoCheckoutHours: 10,
    requireApproval: true,
  },
  notifications: {
    emailEnabled: false,
    leaveReminderDays: 3,
    documentExpiryDays: 30,
  },
  customFields: [],
});

let settings;

class SettingsDAO {
  static async injectDB(conn) {
    if (!settings) {
      settings = conn.collection("org_settings");
      await settings.createIndex({ org: 1 }, { unique: true });
    }
  }

  static getDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  static async getByOrg(orgId) {
    try {
      const doc = await settings.findOne({ org: String(orgId) });
      if (!doc) {
        return { org: String(orgId), ...SettingsDAO.getDefaults() };
      }
      const { _id, ...rest } = doc;
      return rest;
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async upsert(orgId, payload, updatedBy) {
    try {
      const org = String(orgId);
      const update = {
        org,
        payroll: payload.payroll,
        leave: payload.leave,
        attendance: payload.attendance,
        notifications: payload.notifications,
        customFields: payload.customFields || [],
        updatedBy: updatedBy ? String(updatedBy) : null,
        updatedOn: new Date(),
      };
      await settings.updateOne({ org }, { $set: update }, { upsert: true });
      return SettingsDAO.getByOrg(org);
    } catch (e) {
      console.error(e);
      return { error: e.message, server: true };
    }
  }

  static async listOrgIds() {
    try {
      const docs = await settings.find({}, { projection: { org: 1 } }).toArray();
      return docs.map((d) => d.org).filter(Boolean);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

module.exports = SettingsDAO;
