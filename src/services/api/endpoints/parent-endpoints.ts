const Parent = '/Parent';

export const ParentEndpoints = {
  register: `${Parent}/Register`,
  login: `${Parent}/Login`,
  resendOtp: `${Parent}/ResendOtp`,
  // Note: backend spelling is "ConfiremOtp".
  confirmOtp: `${Parent}/ConfiremOtp`,
  changePassword: `${Parent}/ChangePassword`,
  resetPassword: `${Parent}/ResetPassword`,
  update: Parent,
  getProfile: `${Parent}/GetParentProfile`,
  likeFavorite: `${Parent}/LikeFavoriteSchoolBranch`,
  dislikeFavorite: `${Parent}/DisLikeFavoriteSchoolBranch`,
  getByBranchId: (schoolBranchId: string) => `${Parent}/by-branchId/${schoolBranchId}`,
  deleteParentAccount: `${Parent}/DeleteAccount`,
};

export default ParentEndpoints;
