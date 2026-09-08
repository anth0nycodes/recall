export const systemPermissionsApi = {
  getFullDiskAccessStatus: () => window.api.getFullDiskAccessStatus(),
  requestFullDiskAccess: () => window.api.requestFullDiskAccess(),
  getContactsAccessStatus: () => window.api.getContactsAccessStatus(),
  requestContactsAccess: () => window.api.requestContactsAccess(),
};
