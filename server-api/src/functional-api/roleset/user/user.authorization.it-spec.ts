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
import { removeRoleFromUser } from '../roles-request.params';
import {
  CommunityMembershipPolicy,
  CommunityRoleType,
  SpacePrivacyMode,
} from '@generated/alkemio-schema';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
    baseScenario =
      await OrganizationWithSpaceModelFactory.createOrganizationWithSpaceAndUsers();

    await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
      baseScenario.space.id,
      'notification-userMention-subspace',
      baseScenario.subspace
    );

    await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
      baseScenario.subspace.id,
      'notification-userMention-subsubspace',
      baseScenario.subsubspace
    );

  await updateSpaceSettings(baseScenario.space.id, {
    privacy: { mode: SpacePrivacyMode.Public },
    membership: { policy: CommunityMembershipPolicy.Applications },
  });

  await updateSpaceSettings(baseScenario.subspace.id, {
    membership: { policy: CommunityMembershipPolicy.Applications },
    privacy: { mode: SpacePrivacyMode.Private },
  });

  await updateSpaceSettings(baseScenario.subsubspace.id, {
    membership: { policy: CommunityMembershipPolicy.Applications },
    privacy: { mode: SpacePrivacyMode.Private },
  });
  await removeRoleFromUser(
    users.globalAdmin.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await removeRoleFromUser(
    users.globalAdmin.id,
    baseScenario.subspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await removeRoleFromUser(
    users.globalAdmin.id,
    baseScenario.space.community.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
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
          baseScenario.space.community.roleSetId,
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
          baseScenario.subspace.community.roleSetId,
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
          baseScenario.subsubspace.community.roleSetId,
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
