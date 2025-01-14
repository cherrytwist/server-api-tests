import { TestUserManager } from '@src/scenario/TestUserManager';
import { getRoleSetMembersList } from '../roleset.request.params';
import { removeRoleFromUser, assignRoleToUser } from '../roles-request.params';
import { CommunityRoleType } from '@generated/alkemio-schema';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
import { TestSetupUtils } from '@src/scenario/TestSetupUtils';

let baseScenario: OrganizationWithSpaceModel;

const scenarioConfig: TestScenarioConfig = {
  name: 'user-edge',
  space: {
    collaboration: {
      addCallouts: false,
    },
    subspace: {
      collaboration: {
        addCallouts: false,
      },
      subspace: {
        collaboration: {
          addCallouts: false,
        },
      },
    },
  },
};

beforeAll(async () => {
  baseScenario = await TestScenarioFactory.createBaseScenario(scenarioConfig);

  await removeRoleFromUser(
    TestUserManager.users.globalAdmin.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await removeRoleFromUser(
    TestUserManager.users.globalAdmin.id,
    baseScenario.subspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await removeRoleFromUser(
    TestUserManager.users.globalAdmin.id,
    baseScenario.space.community.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Assign / Remove users to community', () => {
  describe('Assign users', () => {
    beforeAll(async () => {
      await assignRoleToUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Lead
      );
    });
    afterAll(async () => {
      await removeRoleFromUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromUser(
        TestUserManager.users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Member
      );
    });

    describe('Assign same user as member to same community', () => {
      test('Does not have any effect in Space', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.nonSpaceMember.id,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.space.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

        // Assert
        expect(data).toHaveLength(2);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subspace', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.nonSpaceMember.id,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.subspace.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

        // Assert
        expect(data).toHaveLength(2);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subsubspace', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.nonSpaceMember.id,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.subsubspace.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

        // Assert
        expect(data).toHaveLength(2);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.nonSpaceMember.email,
            }),
          ])
        );
      });
    });

    describe('Assign different users as member to same community', () => {
      test('Successfully assigned to Space', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.spaceMember.id,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.space.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

        // Assert
        expect(data).toHaveLength(3);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.spaceMember.email,
            }),
          ])
        );
      });

      test('Successfully assigned to Subspace', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.spaceMember.id,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.subspace.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

        // Assert
        expect(data).toHaveLength(3);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.spaceMember.email,
            }),
          ])
        );
      });

      test('Successfully assigned to Subsubspace', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.spaceMember.id,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.subsubspace.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

        // Assert
        expect(data).toHaveLength(3);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.spaceMember.email,
            }),
          ])
        );
      });
    });

    describe('Assign same user as lead to same community', () => {
      test('Does not have any effect in Space', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.nonSpaceMember.id,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.space.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

        // Assert
        expect(data).toHaveLength(1);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subspace', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.nonSpaceMember.id,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.subspace.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

        // Assert
        expect(data).toHaveLength(1);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subsubspace', async () => {
        // Act
        await assignRoleToUser(
          TestUserManager.users.nonSpaceMember.id,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembers = await getRoleSetMembersList(
          baseScenario.subsubspace.community.roleSetId
        );
        const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

        // Assert
        expect(data).toHaveLength(1);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: TestUserManager.users.nonSpaceMember.email,
            }),
          ])
        );
      });
    });
  });
});

describe('Assign different users as lead to same community', () => {
  beforeAll(async () => {
    await TestSetupUtils.assignUsersToRoles(
      baseScenario.space.community.roleSetId,
      0
    );
    await TestSetupUtils.assignUsersToRoles(
      baseScenario.subspace.community.roleSetId,
      1
    );
    await TestSetupUtils.assignUsersToRoles(
      baseScenario.subsubspace.community.roleSetId,
      2
    );

    await assignRoleToUser(
      TestUserManager.users.qaUser.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member
    );

    await assignRoleToUser(
      TestUserManager.users.qaUser.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await assignRoleToUser(
      TestUserManager.users.qaUser.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await assignRoleToUser(
      TestUserManager.users.subsubspaceAdmin.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await assignRoleToUser(
      TestUserManager.users.subspaceAdmin.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await assignRoleToUser(
      TestUserManager.users.spaceAdmin.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Lead
    );
  });
  afterAll(async () => {
    await removeRoleFromUser(
      TestUserManager.users.subsubspaceAdmin.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      TestUserManager.users.subspaceAdmin.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      TestUserManager.users.subsubspaceAdmin.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      TestUserManager.users.subsubspaceAdmin.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await removeRoleFromUser(
      TestUserManager.users.subspaceAdmin.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await removeRoleFromUser(
      TestUserManager.users.spaceAdmin.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member
    );
  });

  test('Should assign second user as Space lead', async () => {
    // Act
    const res = await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Lead
    );

    const roleSetMembers = await getRoleSetMembersList(
      baseScenario.space.community.roleSetId
    );
    const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

    // Assert
    expect(data).toHaveLength(2);
    expect(JSON.stringify(res)).not.toContain(
      '"Max limit of users reached for role \'lead\': 2, cannot assign new user."'
    );
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: TestUserManager.users.spaceMember.email,
        }),
      ])
    );
  });

  test('Should throw error for assigning third user as Space lead', async () => {
    // Act
    const res = await assignRoleToUser(
      TestUserManager.users.qaUser.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Lead
    );

    const roleSetMembers = await getRoleSetMembersList(
      baseScenario.space.community.roleSetId
    );
    const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

    // Assert
    expect(data).toHaveLength(2);
    expect(JSON.stringify(res)).toContain(
      "Max limit of users reached for role 'lead': 2, cannot assign new user."
    );
    expect(data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: TestUserManager.users.qaUser.email,
        }),
      ])
    );
  });

  test('Should assign second user as Subspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      TestUserManager.users.subspaceMember.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    const roleSetMembers = await getRoleSetMembersList(
      baseScenario.subspace.community.roleSetId
    );
    const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

    // Assert
    expect(data).toHaveLength(2);
    expect(JSON.stringify(res)).not.toContain(
      '"Max limit of users reached for role \'lead\': 2, cannot assign new user."'
    );
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: TestUserManager.users.subspaceMember.email,
        }),
      ])
    );
  });

  test('Should throw error for assigning third user as Subspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      TestUserManager.users.qaUser.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    const roleSetMembers = await getRoleSetMembersList(
      baseScenario.subspace.community.roleSetId
    );
    const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

    // Assert
    expect(data).toHaveLength(2);
    expect(JSON.stringify(res)).toContain(
      "Max limit of users reached for role 'lead': 2, cannot assign new user."
    );
    expect(data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: TestUserManager.users.qaUser.email,
        }),
      ])
    );
  });

  test('Should assign second user as Subsubspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      TestUserManager.users.subsubspaceMember.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    const roleSetMembers = await getRoleSetMembersList(
      baseScenario.subsubspace.community.roleSetId
    );
    const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

    // Assert
    expect(data).toHaveLength(2);
    expect(JSON.stringify(res)).not.toContain(
      "Max limit of users reached for role 'lead': 2, cannot assign new user"
    );
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: TestUserManager.users.subsubspaceMember.email,
        }),
      ])
    );
  });

  test('Should throw error for assigning third user as Subspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      TestUserManager.users.qaUser.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    const roleSetMembers = await getRoleSetMembersList(
      baseScenario.subsubspace.community.roleSetId
    );
    const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

    // Assert
    expect(data).toHaveLength(2);
    expect(JSON.stringify(res)).toContain(
      "Max limit of users reached for role 'lead': 2, cannot assign new user"
    );
    expect(data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: TestUserManager.users.qaUser.email,
        }),
      ])
    );
  });
});
