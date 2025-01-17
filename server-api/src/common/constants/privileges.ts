export const readPrivilege = ['READ'];
export const readAboutPrivilege = ['READ_ABOUT'];
export const sorted_read_readAbout = [...readPrivilege, ...readAboutPrivilege];
export const sorted__create_read_update_delete = [
  'CREATE',
  ...readPrivilege,
  'UPDATE',
  'DELETE',
].sort();

export const sorted__create_read_readAbout_update_delete = [
  'CREATE',
  ...sorted_read_readAbout,
  'UPDATE',
  'DELETE',
].sort();

export const sorted__create_read_update_delete_grant = [
  'CREATE',
  'GRANT',
  ...readPrivilege,
  'UPDATE',
  'DELETE',
].sort();

export const sorted__create_read_readAbout_update_delete_grant = [
  'CREATE',
  'GRANT',
  ...sorted_read_readAbout,
  'UPDATE',
  'DELETE',
].sort();

export const sorted__create_read_update_delete_grant_platformAdmin = [
  'CREATE',
  'GRANT',
  ...readPrivilege,
  'UPDATE',
  'DELETE',
  'PLATFORM_ADMIN',
].sort();

export const sorted__create_read_update_delete_grant_readUserPii_platformAdmin = [
  ...sorted__create_read_update_delete_grant,
  'READ_USER_PII',
  'PLATFORM_ADMIN',
].sort();

export const sorted__create_read_update_delete_grant_fileUpload_fileDelete_readUserPii_platformAdmin = [
  ...sorted__create_read_update_delete_grant,
  'READ_USER_PII',
  'FILE_UPLOAD',
  'FILE_DELETE',
  'PLATFORM_ADMIN',
].sort();

export const sorted__create_read_update_delete_fileUpload_fileDelete_readUserPii = [
  ...sorted__create_read_update_delete,
  'READ_USER_PII',
  'FILE_UPLOAD',
  'FILE_DELETE',
].sort();

export const sorted__create_read_update_delete_readUserPii = [
  ...sorted__create_read_update_delete,
  'READ_USER_PII',
].sort();

export const sorted__create_read_update_delete_grant_fileUp_fileDel = [
  ...sorted__create_read_update_delete_grant,
  'FILE_UPLOAD',
  'FILE_DELETE',
].sort();

export const sorted__create_read_readAbout_update_delete_grant_fileUp_fileDel = [
  ...sorted__create_read_readAbout_update_delete_grant,
  'FILE_UPLOAD',
  'FILE_DELETE',
].sort();

export const sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin = [
  ...sorted__create_read_update_delete_grant,
  'FILE_UPLOAD',
  'FILE_DELETE',
  'PLATFORM_ADMIN',
].sort();

export const sorted__create_read_update_delete_grant_fileUp_fileDel_contribute = [
  ...sorted__create_read_update_delete_grant_fileUp_fileDel,
  'CONTRIBUTE',
].sort();

export const sorted__create_read_readAbout_update_delete_grant_fileUp_fileDel_contribute = [
  ...sorted__create_read_readAbout_update_delete_grant_fileUp_fileDel,
  'CONTRIBUTE',
].sort();

// export const sorted__create_read_update_delete_grant_fileUp_fileDel_contribute_updateContent = [
//   ...sorted__create_read_update_delete_grant_fileUp_fileDel,
//   'CONTRIBUTE',
//   'UPDATE_CONTENT',
// ].sort();

export const sorted__create_read_update_delete_grant_fileUp_fileDel_contribute_updateContent = [
  ...sorted__create_read_update_delete_grant_fileUp_fileDel,
  'CONTRIBUTE',
  'UPDATE_CONTENT',
].sort();

export const sorted__create_read_readAbout_update_delete_grant_fileUp_fileDel_contribute_updateContent = [
  ...sorted__create_read_readAbout_update_delete_grant_fileUp_fileDel,
  'CONTRIBUTE',
  'UPDATE_CONTENT',
].sort();

export const sorted__create_read_update_delete_grant_contribute_updateContentt = [
  ...sorted__create_read_update_delete_grant,
  'CONTRIBUTE',
  'UPDATE_CONTENT',
].sort();

export const sorted__create_read_readAbout_update_delete_grant_contribute_updateContentt = [
  ...sorted__create_read_readAbout_update_delete_grant,
  'CONTRIBUTE',
  'UPDATE_CONTENT',
].sort();

export const addMember_invite = ['COMMUNITY_ADD_MEMBER', 'COMMUNITY_INVITE'];

export const sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC = [
  'CREATE',
  'GRANT',
  ...readPrivilege,
  'UPDATE',
  'DELETE',
  'COMMUNITY_ADD_MEMBER',
  'COMMUNITY_APPLY',
  'COMMUNITY_INVITE',
  'COMMUNITY_ADD_MEMBER_VC_FROM_ACCOUNT',
].sort();

export const sorted__create_read_update_delete_grant_apply_invite_addVC_accessVC = [
  'CREATE',
  'GRANT',
  ...readPrivilege,
  'UPDATE',
  'DELETE',
  'COMMUNITY_APPLY',
  'COMMUNITY_INVITE',
  'COMMUNITY_ADD_MEMBER_VC_FROM_ACCOUNT',
].sort();

export const sorted__applyToCommunity_joinCommunity = [
  'COMMUNITY_APPLY',
  'COMMUNITY_JOIN',
].sort();

export const sorted__read_applyToCommunity = ['READ', 'COMMUNITY_APPLY'].sort();

export const sorted__read_applyToCommunity_invite_addVC = [
  'READ',
  'COMMUNITY_APPLY',
  'COMMUNITY_INVITE',
  'COMMUNITY_ADD_MEMBER_VC_FROM_ACCOUNT',
].sort();

export const sorted__create_read_update_delete_grant_contribute = [
  ...sorted__create_read_update_delete_grant,
  'CONTRIBUTE',
].sort();

export const sorted__create_read_readAbout_update_delete_grant_contribute = [
  ...sorted__create_read_readAbout_update_delete_grant,
  'CONTRIBUTE',
].sort();

export const sorted__create_read_update_delete_grant_contribute_updateContent = [
  ...sorted__create_read_update_delete_grant,
  'CONTRIBUTE',
  'UPDATE_CONTENT',
].sort();

export const sorted__create_read_update_delete_grant_createSubspace = [
  ...sorted__create_read_update_delete_grant,
  'CREATE_SUBSPACE',
].sort();

export const sorted__create_read_readAbout_update_delete_grant_createSubspace = [
  ...sorted__create_read_readAbout_update_delete_grant,
  'CREATE_SUBSPACE',
].sort();

export const sorted__create_read_update_delete_grant_authorizationReset_createSubspace_platformAdmin = [
  ...sorted__create_read_update_delete_grant,
  'AUTHORIZATION_RESET',
  'CREATE_SUBSPACE',
  'PLATFORM_ADMIN',
].sort();

export const sorted__create_read_update_delete_grant_createSubspace_platformAdmin = [
  ...sorted__create_read_update_delete_grant,
  'CREATE_SUBSPACE',
  'PLATFORM_ADMIN',
].sort();

export const sorted__create_read_readAbout_update_delete_grant_createSubspace_platformAdmin = [
  ...sorted__create_read_readAbout_update_delete_grant,
  'CREATE_SUBSPACE',
  'PLATFORM_ADMIN',
].sort();
