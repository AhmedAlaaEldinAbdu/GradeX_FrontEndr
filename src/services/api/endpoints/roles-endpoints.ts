const ROLES = '/roles';

export const RolesEndpoints = {
  getRoles: `${ROLES}/getAllList`,
  getAllRoles: `${ROLES}/getAll`,
  getRoleById: (id: string) => `${ROLES}/${id}`,
  createRole: `${ROLES}/create`,
  updateRole: `${ROLES}/update`,
  deleteRole: (id: string) => `${ROLES}/delete/${id}`,
};
