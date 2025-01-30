import { getRoleSetUserPrivilege } from '../../journey/space/space.request.params';
import { TestUser } from '@alkemio/tests-lib';
import {
  sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC,
  sorted__create_read_update_delete_grant_apply_invite_addVC_accessVC,
  sorted__read_applyToRoleSet,
  sorted__read_applyToRoleSet_invite_addVC,
} from '@common/constants/privileges';
import {
  CommunityMembershipPolicy,
  SpacePrivacyMode,
} from '@generated/alkemio-schema';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'access-user-authorizations',
  space: {
    community: {
      admins: [TestUser.SPACE_ADMIN],
      members: [
        TestUser.SPACE_MEMBER,
        TestUser.SPACE_ADMIN,
        TestUser.SUBSPACE_MEMBER,
        TestUser.SUBSPACE_ADMIN,
        TestUser.SUBSUBSPACE_MEMBER,
        TestUser.SUBSUBSPACE_ADMIN,
      ],
    },
    settings: {
      privacy: { mode: SpacePrivacyMode.Public },
      membership: { policy: CommunityMembershipPolicy.Applications },
    },
    subspace: {
      community: {
        admins: [TestUser.SUBSPACE_ADMIN],
        members: [
          TestUser.SUBSPACE_MEMBER,
          TestUser.SUBSPACE_ADMIN,
          TestUser.SUBSUBSPACE_MEMBER,
          TestUser.SUBSUBSPACE_ADMIN,
        ],
      },
      settings: {
        privacy: { mode: SpacePrivacyMode.Private },
        membership: { policy: CommunityMembershipPolicy.Applications },
      },
      subspace: {
        community: {
          admins: [TestUser.SUBSUBSPACE_ADMIN],
          members: [TestUser.SUBSUBSPACE_MEMBER, TestUser.SUBSUBSPACE_ADMIN],
        },
        settings: {
          privacy: { mode: SpacePrivacyMode.Private },
          membership: { policy: CommunityMembershipPolicy.Applications },
        },
      },
    },
  },
};

beforeAll(async () => {
  baseScenario = await TestScenarioFactory.createBaseScenario(scenarioConfig);
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Verify ROLESET_ENTRY_ROLE_ASSIGN privilege', () => {
  describe('DDT role privilege to assign member to space', () => {
    // ${TestUser.GLOBAL_COMMUNITY_ADMIN} | ${sorted__applyToCommunity} - check if the privileges, that the role should have are: ["ROLESET_ENTRY_ROLE_ASSIGN", "ROLESET_ENTRY_ROLE_APPLY", "ROLESET_ENTRY_ROLE_INVITE", "CREATE", "DELETE", "GRANT", "READ", "UPDATE", ]
    // Arrange
    test.each`
      user                             | myPrivileges
      ${TestUser.GLOBAL_ADMIN}         | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.GLOBAL_SUPPORT_ADMIN} | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_ADMIN}          | ${sorted__create_read_update_delete_grant_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_MEMBER}         | ${sorted__read_applyToRoleSet}
      ${TestUser.SUBSPACE_ADMIN}       | ${sorted__read_applyToRoleSet_invite_addVC}
      ${TestUser.SUBSPACE_MEMBER}      | ${sorted__read_applyToRoleSet}
      ${TestUser.SUBSUBSPACE_ADMIN}    | ${sorted__read_applyToRoleSet}
      ${TestUser.SUBSUBSPACE_MEMBER}   | ${sorted__read_applyToRoleSet}
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
      user                             | myPrivileges
      ${TestUser.GLOBAL_ADMIN}         | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.GLOBAL_SUPPORT_ADMIN} | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_ADMIN}          | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_MEMBER}         | ${['ROLESET_ENTRY_ROLE_APPLY']}
      ${TestUser.SUBSPACE_ADMIN}       | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SUBSPACE_MEMBER}      | ${sorted__read_applyToRoleSet}
      ${TestUser.SUBSUBSPACE_ADMIN}    | ${sorted__read_applyToRoleSet_invite_addVC}
      ${TestUser.SUBSUBSPACE_MEMBER}   | ${sorted__read_applyToRoleSet}
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
      user                             | myPrivileges
      ${TestUser.GLOBAL_ADMIN}         | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.GLOBAL_SUPPORT_ADMIN} | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_ADMIN}          | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SPACE_MEMBER}         | ${['ROLESET_ENTRY_ROLE_APPLY']}
      ${TestUser.SUBSPACE_ADMIN}       | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SUBSPACE_MEMBER}      | ${['ROLESET_ENTRY_ROLE_APPLY']}
      ${TestUser.SUBSUBSPACE_ADMIN}    | ${sorted__create_read_update_delete_grant_addMember_apply_invite_addVC_accessVC}
      ${TestUser.SUBSUBSPACE_MEMBER}   | ${sorted__read_applyToRoleSet}
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
