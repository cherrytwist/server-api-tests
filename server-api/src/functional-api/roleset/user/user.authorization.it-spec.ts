import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import { users } from '@utils/queries/users-data';
import {
  deleteSpace,
  getRoleSetUserPrivilege,
  updateSpaceSettings,
} from '../../journey/space/space.request.params';
import { TestUser } from '@alkemio/tests-lib';
import {
  sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC,
  sorted__create_read_update_delete_grant_apply_invite_addVC_accessVC,
  sorted__read_applyToCommunity,
  sorted__read_applyToCommunity_invite_addVC,
} from '@common/constants/privileges';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { removeRoleFromUser } from '../roles-request.params';

import { entitiesId } from '../../../types/entities-helper';
import {
  CommunityMembershipPolicy,
  CommunityRoleType,
  SpacePrivacyMode,
} from '@generated/alkemio-schema';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';

const organizationName = 'com-org-name' + uniqueId;
const hostNameId = 'com-org-nameid' + uniqueId;
const spaceName = 'com-eco-name' + uniqueId;
const spaceNameId = 'com-eco-nameid' + uniqueId;
const subsubspaceName = 'com-opp';
const subspaceName = 'com-chal';

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );

  await updateSpaceSettings(entitiesId.spaceId, {
    privacy: { mode: SpacePrivacyMode.Public },
    membership: { policy: CommunityMembershipPolicy.Applications },
  });
  await createSubspaceWithUsers(subspaceName);
  await updateSpaceSettings(entitiesId.subspace.id, {
    membership: { policy: CommunityMembershipPolicy.Applications },
    privacy: { mode: SpacePrivacyMode.Private },
  });
  await createSubsubspaceWithUsers(subsubspaceName);
  await updateSpaceSettings(entitiesId.subsubspace.id, {
    membership: { policy: CommunityMembershipPolicy.Applications },
    privacy: { mode: SpacePrivacyMode.Private },
  });
  await removeRoleFromUser(
    users.globalAdmin.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Lead
  );

  await removeRoleFromUser(
    users.globalAdmin.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Lead
  );

  await removeRoleFromUser(
    users.globalAdmin.id,
    entitiesId.space.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Verify COMMUNITY_ADD_MEMBER privilege', () => {
  describe('DDT role privilege to assign member to space', () => {
    // ${TestUser.GLOBAL_COMMUNITY_ADMIN} | ${sorted__applyToCommunity} - check if the privileges, that the role should have are: ["COMMUNITY_ADD_MEMBER", "COMMUNITY_APPLY", "COMMUNITY_INVITE", "CREATE", "DELETE", "GRANT", "READ", "UPDATE", ]
    // Arrange
    test.each`
      user                           | myPrivileges
      ${TestUser.GLOBAL_ADMIN}       | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.GLOBAL_LICENSE_ADMIN}  | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_ADMIN}          | ${sorted__create_read_update_delete_grant_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_MEMBER}         | ${sorted__read_applyToCommunity}
      ${TestUser.SUBSPACE_ADMIN}    | ${sorted__read_applyToCommunity_invite_addVC}
      ${TestUser.SUBSPACE_MEMBER}   | ${sorted__read_applyToCommunity}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${sorted__read_applyToCommunity}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${sorted__read_applyToCommunity}
    `(
      'User: "$user", should have privileges: "$myPrivileges" for space journey',
      async ({ user, myPrivileges }) => {
        const request = await getRoleSetUserPrivilege(
          entitiesId.space.roleSetId,
          user
        );
        const result =
          request?.data?.lookup?.roleSet?.authorization?.myPrivileges;

        // Assert
        expect(result?.sort()).toEqual(myPrivileges);
      }
    );
  });

  describe('DDT role privilege to assign member to subspace', () => {
    // Arrange
    test.each`
      user                           | myPrivileges
      ${TestUser.GLOBAL_ADMIN}       | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.GLOBAL_LICENSE_ADMIN}  | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_ADMIN}          | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_MEMBER}         | ${['COMMUNITY_APPLY']}
      ${TestUser.SUBSPACE_ADMIN}    | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SUBSPACE_MEMBER}   | ${sorted__read_applyToCommunity}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${sorted__read_applyToCommunity_invite_addVC}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${sorted__read_applyToCommunity}
    `(
      'User: "$user", should have privileges: "$myPrivileges" for subspace journey',
      async ({ user, myPrivileges }) => {
        const request = await getRoleSetUserPrivilege(
          entitiesId.subspace.roleSetId,
          user
        );
        const result =
          request.data?.lookup?.roleSet?.authorization?.myPrivileges ?? [];

        // Assert
        expect(result.sort()).toEqual(myPrivileges);
      }
    );
  });

  describe('DDT role privilege to assign member to subsubspace', () => {
    // Arrange
    test.each`
      user                           | myPrivileges
      ${TestUser.GLOBAL_ADMIN}       | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.GLOBAL_LICENSE_ADMIN}  | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_ADMIN}          | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_MEMBER}         | ${['COMMUNITY_APPLY']}
      ${TestUser.SUBSPACE_ADMIN}    | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SUBSPACE_MEMBER}   | ${['COMMUNITY_APPLY']}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${sorted__read_applyToCommunity}
    `(
      'User: "$user", should have privileges: "$myPrivileges" for subsubspace journey',
      async ({ user, myPrivileges }) => {
        const request = await getRoleSetUserPrivilege(
          entitiesId.subsubspace.roleSetId,
          user
        );
        const result =
          request.data?.lookup?.roleSet?.authorization?.myPrivileges ?? [];

        // Assert
        expect(result.sort()).toEqual(myPrivileges);
      }
    );
  });
});