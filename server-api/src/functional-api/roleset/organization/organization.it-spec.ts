import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import { deleteSpace } from '../../journey/space/space.request.params';
import {
  createSubspaceForOrgSpace,
  createSubsubspaceForSubspace,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import {
  removeRoleFromOrganization,
  assignRoleToOrganization,
} from '../roles-request.params';
import { entitiesId } from '../../../types/entities-helper';
import { getRoleSetMembersList } from '../roleset.request.params';
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
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Assign / Remove organization to community', () => {
  describe('Assign organization', () => {
    afterAll(async () => {
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );
    });
    test('Assign organization as member to space', async () => {
      // Act
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            nameID: hostNameId,
          }),
        ])
      );
    });
    test('Assign organization as member to subspace', async () => {
      // Act
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            nameID: hostNameId,
          }),
        ])
      );
    });
    test('Assign organization as member to subsubspace', async () => {
      // Act
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            nameID: hostNameId,
          }),
        ])
      );
    });

    test('Assign organization as lead to space', async () => {
      // Act
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(1);

      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            nameID: hostNameId,
          }),
        ])
      );
    });
    test('Assign organization as lead to subspace', async () => {
      // Act
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            nameID: hostNameId,
          }),
        ])
      );
    });
    test('Assign organization as lead to subsubspace', async () => {
      // Act
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(1);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            nameID: hostNameId,
          }),
        ])
      );
    });
  });

  describe('Remove organization', () => {
    beforeAll(async () => {
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );
      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );
    });
    test('Remove organization as member from subsubspace', async () => {
      // Act
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as member from subspace', async () => {
      // Act
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as member from space', async () => {
      // Act
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });

    test('Remove organization as lead from subsubspace', async () => {
      // Act
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as lead from subspace', async () => {
      // Act
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as lead from space', async () => {
      // Act
      await removeRoleFromOrganization(
        entitiesId.organization.id,
        entitiesId.space.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        entitiesId.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
  });
});
