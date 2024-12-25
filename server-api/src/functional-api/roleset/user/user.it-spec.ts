import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import { deleteSpace } from '../../journey/space/space.request.params';
import {
  createSubspaceForOrgSpace,
  createSubsubspaceForSubspace,
  createOrgAndSpace,
} from '@utils/data-setup/entities';

import { entitiesId } from '../../../types/entities-helper';
import {
  getRoleSetUsersInLeadRole,
  getRoleSetUsersInMemberRole,
  getRoleSetMembersList,
} from '../roleset.request.params';
import { users } from '@utils/queries/users-data';
import { assignRoleToUser, removeRoleFromUser } from '../roles-request.params';
import { CommunityRoleType } from '@generated/graphql';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';

const organizationName = 'com-org-name' + uniqueId;
const hostNameId = 'com-org-nameid' + uniqueId;
const spaceName = 'com-eco-name' + uniqueId;
const spaceNameId = 'com-eco-nameid' + uniqueId;
const subsubspaceName = 'com-opp';
const subspaceName = 'com-chal';

beforeAll(async () => {
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
  await createSubspaceForOrgSpace(subspaceName);
  await createSubsubspaceForSubspace(subsubspaceName);

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

describe('Assign / Remove users to community', () => {
  describe('Assign users', () => {
    afterAll(async () => {
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );
    });
    test('Assign user as member to space', async () => {
      // Act
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
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

    test('Assign user as member to subspace', async () => {
      // Act
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
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
    test('Assign user as member to subsubspace', async () => {
      // Act
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
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

    test('Assign user as lead to space', async () => {
      // Act
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
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
    test('Assign user as lead to subspace', async () => {
      // Act
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
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
    test('Assign user as lead to subsubspace', async () => {
      // Act
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
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

  describe('Remove users', () => {
    beforeAll(async () => {
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );
    });
    test('Remove user as lead from subsubspace', async () => {
      // Act
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

      // Assert
      expect(data).toHaveLength(0);
      expect(data).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: users.nonSpaceMember.email,
          }),
        ])
      );
    });
    test('Remove user as lead from subspace', async () => {
      // Act
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

      // Assert
      expect(data).toHaveLength(0);
      expect(data).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: users.nonSpaceMember.email,
          }),
        ])
      );
    });
    test('Remove user as lead from space', async () => {
      // Act
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadUsers;

      // Assert
      expect(data).toHaveLength(0);
      expect(data).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: users.nonSpaceMember.email,
          }),
        ])
      );
    });

    test('Remove user as member from subsubspace', async () => {
      // Act
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            email: users.nonSpaceMember.email,
          }),
        ])
      );
    });
    test('Remove user as member from subspace', async () => {
      // Act
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            email: users.nonSpaceMember.email,
          }),
        ])
      );
    });
    test('Remove user as member from space', async () => {
      // Act
      await removeRoleFromUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberUsers;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            email: users.nonSpaceMember.email,
          }),
        ])
      );
    });
  });
});

describe('Available users', () => {
  describe('Space available users', () => {
    test('Available members', async () => {
      const availableUsersBeforeAssign = await getRoleSetUsersInMemberRole(
        entitiesId.space.roleSetId
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      const availableUsers = await getRoleSetUsersInMemberRole(
        entitiesId.space.roleSetId
      );

      // Assert
      expect(availableUsers.length).toEqual(
        availableUsersBeforeAssign.length + 1
      );
      expect(availableUsers).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: users.qaUser.id,
          }),
        ])
      );
    });

    test('Available leads', async () => {
      const availableUsersBeforeAssign = await getRoleSetUsersInLeadRole(
        entitiesId.space.roleSetId
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );

      const availableUsers = await getRoleSetUsersInLeadRole(
        entitiesId.space.roleSetId
      );

      // Assert
      expect(availableUsers.length).toEqual(
        availableUsersBeforeAssign.length + 1
      );
      expect(availableUsers).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: users.qaUser.id,
          }),
        ])
      );
    });
  });
  describe('Subspace available users', () => {
    beforeAll(async () => {
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );
    });
    test('Available members', async () => {
      const availableUsersBeforeAssign = await getRoleSetUsersInMemberRole(
        entitiesId.subspace.roleSetId
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      const availableUsers = await getRoleSetUsersInMemberRole(
        entitiesId.subspace.roleSetId
      );

      // Assert
      expect(availableUsers.length).toEqual(
        availableUsersBeforeAssign.length + 1
      );
      expect(availableUsers).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: users.spaceMember.id,
          }),
        ])
      );
    });

    test('Available leads', async () => {
      const availableUsersBeforeAssign = await getRoleSetUsersInLeadRole(
        entitiesId.subspace.roleSetId
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      const availableUsers = await getRoleSetUsersInLeadRole(
        entitiesId.subspace.roleSetId
      );

      // Assert
      expect(availableUsers.length).toEqual(
        availableUsersBeforeAssign.length + 1
      );
      expect(availableUsers).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: users.spaceMember.id,
          }),
        ])
      );
    });
  });
  describe('Subsubspace available users', () => {
    beforeAll(async () => {
      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );
    });
    test('Available members', async () => {
      const availableUsersBeforeAssign = await getRoleSetUsersInMemberRole(
        entitiesId.subsubspace.roleSetId
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      const availableUsers = await getRoleSetUsersInMemberRole(
        entitiesId.subsubspace.roleSetId
      );

      // Assert
      expect(availableUsers.length).toEqual(
        availableUsersBeforeAssign.length + 1
      );
      expect(availableUsers).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: users.qaUser.id,
          }),
        ])
      );
    });

    test('Available leads', async () => {
      const availableUsersBeforeAssign = await getRoleSetUsersInLeadRole(
        entitiesId.subsubspace.roleSetId
      );

      await assignRoleToUser(
        users.nonSpaceMember.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      const availableUsers = await getRoleSetUsersInLeadRole(
        entitiesId.subsubspace.roleSetId
      );

      // Assert
      expect(availableUsers.length).toEqual(
        availableUsersBeforeAssign.length + 1
      );
      expect(availableUsers).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: users.qaUser.id,
          }),
        ])
      );
    });
  });
});
