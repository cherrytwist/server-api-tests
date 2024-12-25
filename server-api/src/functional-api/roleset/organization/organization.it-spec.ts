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
import { baseScenario } from '../../../types/entities-helper';
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
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

describe('Assign / Remove organization to community', () => {
  describe('Assign organization', () => {
    afterAll(async () => {
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Member
      );
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Lead
      );
    });
    test('Assign organization as member to space', async () => {
      // Act
      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.space.roleSetId
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
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subspace.roleSetId
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
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subsubspace.roleSetId
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
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.space.roleSetId
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
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subspace.roleSetId
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
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subsubspace.roleSetId
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
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Member
      );
      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );
      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Lead
      );
    });
    test('Remove organization as member from subsubspace', async () => {
      // Act
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as member from subspace', async () => {
      // Act
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as member from space', async () => {
      // Act
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Member
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.memberOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });

    test('Remove organization as lead from subsubspace', async () => {
      // Act
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subsubspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as lead from subspace', async () => {
      // Act
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.subspace.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
    test('Remove organization as lead from space', async () => {
      // Act
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.space.roleSetId,
        CommunityRoleType.Lead
      );

      const roleSetMembers = await getRoleSetMembersList(
        baseScenario.space.roleSetId
      );
      const data = roleSetMembers.data?.lookup.roleSet?.leadOrganizations;

      // Assert
      expect(data).toHaveLength(0);
    });
  });
});
