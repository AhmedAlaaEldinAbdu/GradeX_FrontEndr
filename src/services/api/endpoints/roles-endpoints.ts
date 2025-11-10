const ROLES = '/roles';

export const RolesEndpoints = {
  getRoles: `${ROLES}/getAllList`,
  getRoleById: (id: string) => `${ROLES}/${id}`,
  createRole: `${ROLES}/create`,
  updateRole: (id: string) => `${ROLES}/${id}`,
  deleteRole: (id: string) => `${ROLES}/${id}`,
};
