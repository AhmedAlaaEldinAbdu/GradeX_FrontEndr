const USERS = '/users';

export const UsersEndpoints = {
  getAllUsers: `${USERS}/getAllUsers`,
  getUserById: (id: string) => `${USERS}/${id}`,
  createUser: `${USERS}/create`,
  updateUser: `${USERS}/update`,
  deleteUser: `${USERS}/Delete`,
  assignSchoolRole: `${USERS}/assignSchoolRole`,
};
