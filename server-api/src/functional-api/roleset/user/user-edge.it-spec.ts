import { users } from '@utils/queries/users-data';
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
      addCallouts: true,
    },
    subspace: {
      collaboration: {
        addCallouts: true,
      },
      subspace: {
        collaboration: {
          addCallouts: true,
        },
      },
    },
  },
};

beforeAll(async () => {
  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);

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
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Assign / Remove users to community', () => {
  describe('Assign users', () => {
    beforeAll(async () => {
      await assignRoleToUser(
        users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Lead
      );
    });
    afterAll(async () => {
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Member
      );
    });

    describe('Assign same user as member to same community', () => {
      test('Does not have any effect in Space', async () => {
        // Act
        await assignRoleToUser(
          users.nonSpaceMember.id,
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
              email: users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subspace', async () => {
        // Act
        await assignRoleToUser(
          users.nonSpaceMember.id,
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
              email: users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subsubspace', async () => {
        // Act
        await assignRoleToUser(
          users.nonSpaceMember.id,
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
              email: users.nonSpaceMember.email,
            }),
          ])
        );
      });
    });

    describe('Assign different users as member to same community', () => {
      test('Successfully assigned to Space', async () => {
        // Act
        await assignRoleToUser(
          users.spaceMember.id,
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
              email: users.spaceMember.email,
            }),
          ])
        );
      });

      test('Successfully assigned to Subspace', async () => {
        // Act
        await assignRoleToUser(
          users.spaceMember.id,
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
              email: users.spaceMember.email,
            }),
          ])
        );
      });

      test('Successfully assigned to Subsubspace', async () => {
        // Act
        await assignRoleToUser(
          users.spaceMember.id,
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
              email: users.spaceMember.email,
            }),
          ])
        );
      });
    });

    describe('Assign same user as lead to same community', () => {
      test('Does not have any effect in Space', async () => {
        // Act
        await assignRoleToUser(
          users.nonSpaceMember.id,
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
              email: users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subspace', async () => {
        // Act
        await assignRoleToUser(
          users.nonSpaceMember.id,
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
              email: users.nonSpaceMember.email,
            }),
          ])
        );
      });

      test('Does not have any effect in Subsubspace', async () => {
        // Act
        await assignRoleToUser(
          users.nonSpaceMember.id,
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
              email: users.nonSpaceMember.email,
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
      baseScenario.space.community.roleSetId
    );
    await TestSetupUtils.assignUsersToRoles(
      baseScenario.subspace.community.roleSetId
    );
    await TestSetupUtils.assignUsersToRoles(
      baseScenario.subsubspace.community.roleSetId
    );

    await assignRoleToUser(
      users.qaUser.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member
    );

    await assignRoleToUser(
      users.qaUser.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await assignRoleToUser(
      users.qaUser.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await assignRoleToUser(
      users.subsubspaceAdmin.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await assignRoleToUser(
      users.subspaceAdmin.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await assignRoleToUser(
      users.spaceAdmin.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Lead
    );
  });
  afterAll(async () => {
    await removeRoleFromUser(
      users.subsubspaceAdmin.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      users.subspaceAdmin.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      users.subsubspaceAdmin.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      users.subsubspaceAdmin.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await removeRoleFromUser(
      users.subspaceAdmin.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await removeRoleFromUser(
      users.spaceAdmin.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member
    );
  });

  test('Should assign second user as Space lead', async () => {
    // Act
    const res = await assignRoleToUser(
      users.spaceMember.id,
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
          email: users.spaceMember.email,
        }),
      ])
    );
  });

  test('Should throw error for assigning third user as Space lead', async () => {
    // Act
    const res = await assignRoleToUser(
      users.qaUser.id,
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
          email: users.qaUser.email,
        }),
      ])
    );
  });

  test('Should assign second user as Subspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      users.subspaceMember.id,
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
          email: users.subspaceMember.email,
        }),
      ])
    );
  });

  test('Should throw error for assigning third user as Subspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      users.qaUser.id,
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
          email: users.qaUser.email,
        }),
      ])
    );
  });

  test('Should assign second user as Subsubspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      users.subsubspaceMember.id,
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
          email: users.subsubspaceMember.email,
        }),
      ])
    );
  });

  test('Should throw error for assigning third user as Subspace lead', async () => {
    // Act
    const res = await assignRoleToUser(
      users.qaUser.id,
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
          email: users.qaUser.email,
        }),
      ])
    );
  });
});
