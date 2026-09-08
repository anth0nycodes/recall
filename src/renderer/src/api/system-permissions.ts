export const systemPermissionsApi = {
  getFullDiskAccessStatus: () => window.api.getFullDiskAccessStatus(),
  requestFullDiskAccess: () => window.api.requestFullDiskAccess(),
  relaunchApp: () => window.api.relaunchApp(),
  getContactsAccessStatus: () => window.api.getContactsAccessStatus(),
  requestContactsAccess: () => window.api.requestContactsAccess(),
};
