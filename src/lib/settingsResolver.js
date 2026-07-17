const SettingsDAO = require("../features/settings/settingsDAO");

async function getOrgSettings(orgId) {
  const settings = await SettingsDAO.getByOrg(orgId);
  if (settings?.error) {
    return SettingsDAO.getDefaults();
  }
  return settings;
}

module.exports = { getOrgSettings };
