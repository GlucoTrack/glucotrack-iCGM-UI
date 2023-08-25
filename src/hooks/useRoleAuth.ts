import User from "@/interfaces/User";


export const accountRoles = {
  Administrator: 'Administrator',
  //Researcher: 'Researcher',
  //GlucoTrack: 'GlucoTrack',
  Guest: 'Guest'
};

// export const emptyUserAccount: User = {
//   _id: "",
//   username: "",
//   firstName: "",
//   lastName: "",
//   email: "",
//   countryCode: 1,
//   phone: "",
//   role: "",
//   createdBy: "",
//   updatedBy: "",
// };



//  Generic authentication of Admin role:
//
function authenticateAdminRole(role: string) {
  if (role === accountRoles.Administrator) {
    return true;
  }
  return false;
}


//      /* DEVICES */

//  Add Device permission:
//
export function authenticateRoleAddDevice(role: string) {
  return authenticateAdminRole(role);
}

//  Edit Device permission:
//
export function authenticateRoleEditDevice(role: string) {
  return authenticateAdminRole(role);
}

//  See Devices Info (Admin + Research):
//
export function authenticateRoleDevicesInfo(role: string) {
  const adminRole = authenticateAdminRole(role);
  if (adminRole /* && role === accountRoles.Researcher */ ) {
    return true;
  }
  return false;
}


//      /* GROUPS */

//  Add Group permission:
//
export function authenticateRoleAddGroup(role: string) {
  return authenticateAdminRole(role);
}

//  Edit Group permission:
//
export function authenticateRoleEditGroup(role: string) {
  return authenticateAdminRole(role);
}

//  See Groups Info (Admin + Research):
//
export function authenticateRoleGroupsInfo(role: string) {
  const adminRole = authenticateAdminRole(role);
  if (adminRole /* && role === accountRoles.Researcher */ ) {
    return true;
  }
  return false;
}

//      /* MEASUREMENTS */

//  See Measurements Info (Admin + Research):
//
export function authenticateRoleMeasurementsInfo(role: string) {
  const adminRole = authenticateAdminRole(role);
  if (adminRole /* && role === accountRoles.Researcher */ ) {
    return true;
  }
  return false;
}


//      /* USERS */

//  Add User permission:
//
export function authenticateRoleAddUser(role: string) {
  return authenticateAdminRole(role);
}

//  Edit User permission:
//
export function authenticateRoleEditUser(role: string) {
  return authenticateAdminRole(role);
}

//  See Users Info (Admin + Research):
//
export function authenticateRoleUsersInfo(role: string) {
  const adminRole = authenticateAdminRole(role);
  if (adminRole /* && role === accountRoles.Researcher */ ) {
    return true;
  }
  return false;
}

