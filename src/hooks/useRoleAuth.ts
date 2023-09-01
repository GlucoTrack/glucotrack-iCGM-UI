import User from "@/interfaces/User";

export const accountRoles = {
  Superadmin: 'Superadmin',
  Administrator: 'Administrator',
  Researcher: 'Researcher',
  //GlucoTrack: 'GlucoTrack',
  Guest: 'Guest'
};

// Superadmin
function authenticateSuperAdmin(role: string) {
  if (role === accountRoles.Superadmin) {
    return true;
  }
  return false;
}

//  Generic authentication of Admin role:
//
function authenticateAdminRole(role: string) {
  if (role === accountRoles.Administrator) {
    return true;
  }
  return false;
}

// Reasearcher
function authenticateReasearchRole(role: string) {
  if (role === accountRoles.Researcher) {
    return true;
  }
  return false;
}

//      /* DEVICES */

//  [CREATE] - Add Device permission:
//
export function authenticateRoleAddDevice(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)
}

//  [READ] - See Devices Info (Admin + Research):
//
export function authenticateRoleDevicesInfo(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  const isResearcher = authenticateReasearchRole(role);

  return (isSuperAdmin || isAdmin || isResearcher)

  // const adminRole = authenticateAdminRole(role);
  // if (adminRole /* && role === accountRoles.Researcher */ ) {
  //   return true;
  // }
  // return false;
}

//  [UPDATE] - Edit Device permission:
//
export function authenticateRoleEditDevice(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)
}

//  [DELETE] - Delete Devices (Only Superadmin):
//
export function authenticateRoleDevicesDelete(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  return (isSuperAdmin)
}


//      /* GROUPS */

//  [CREATE] - Add Group permission:
//
export function authenticateRoleAddGroup(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)
}

//  [READ] - See Groups Info (Admin + Research):
//
export function authenticateRoleGroupsInfo(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  const isResearcher = authenticateReasearchRole(role);

  return (isSuperAdmin || isAdmin || isResearcher)
}

//  [UPDATE] - Edit Group permission:
//
export function authenticateRoleEditGroup(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)
}

//  [DELETE] - Delete Groups (Superadmin & Admin?):
//
export function authenticateRoleGroupDelete(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)
}


//      /* MEASUREMENTS */

//  [READ] - See Measurements Info (Admin + Research):
//
export function authenticateRoleMeasurementsInfo(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  const isResearcher = authenticateReasearchRole(role);

  return (isSuperAdmin || isAdmin || isResearcher)
}


//      /* USERS */

//  [CREATE] - Add User permission:
//
export function authenticateRoleAddUser(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)

  // return authenticateSuperAdmin(role);
}

//  [UPDATE] - Edit User permission:
//
export function authenticateRoleEditUser(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)

  //return authenticateSuperAdmin(role);
}

//  [READ] - See Users Info (Admin + Research):
//
export function authenticateRoleUsersInfo(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  const isAdmin = authenticateAdminRole(role);
  return (isSuperAdmin || isAdmin)
}

//  [DELETE] - Delete Users (Only Superadmin):
//
export function authenticateRoleUserDelete(role: string) {
  const isSuperAdmin = authenticateSuperAdmin(role);
  return (isSuperAdmin)
}

