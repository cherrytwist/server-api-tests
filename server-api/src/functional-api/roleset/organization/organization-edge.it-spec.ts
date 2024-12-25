import { deleteSpace } from '../../journey/space/space.request.params';
import { getRoleSetMembersList } from '../roleset.request.params';
import {
  assignRoleToOrganization,
  removeRoleFromOrganization,
} from '../roles-request.params';
import { CommunityRoleType } from '@generated/graphql';
import {
  createOrganization,
  deleteOrganization,
} from '@functional-api/contributor-management/organization/organization.request.params';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';

let newOrgId = '';
const newOrgNameId = 'ha-new-org-nameid';

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  baseScenario =
    await OrganizationWithSpaceModelFactory.createOrganizationWithSpace();

  await OrganizationWithSpaceModelFactory.createSubspace(
    baseScenario.space.id,
    'subspace',
    baseScenario.subspace
  );
  await OrganizationWithSpaceModelFactory.createSubspace(
    baseScenario.subspace.id,
    'subsubspace',
    baseScenario.subsubspace
  );

  const newOrgName = 'ha-new-org';
  const res = await createOrganization(newOrgName, newOrgNameId);
  newOrgId = res.data?.createOrganization?.id ?? '';
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
  await deleteOrganization(newOrgId);
});

describe('Assign / Remove organization to community', () => {
  describe('Assign organizations', () => {
    beforeAll(async () => {
      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Member
      );
      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Member
      );

      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Lead
      );
      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await assignRoleToOrganization(
        baseScenario.organization.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Lead
      );
    });
    afterAll(async () => {
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Member
      );
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Member
      );

      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subsubspace.community.roleSetId,
        CommunityRoleType.Lead
      );
      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.subspace.community.roleSetId,
        CommunityRoleType.Lead
      );

      await removeRoleFromOrganization(
        baseScenario.organization.id,
        baseScenario.space.community.roleSetId,
        CommunityRoleType.Lead
      );
    });
    describe('Assign same organization as member to same community', () => {
      test('Error is thrown for Space', async () => {
        // Act
        const res = await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Member
        );

        const getRoleSetMembers = await getRoleSetMembersList(
          baseScenario.space.community.roleSetId
        );
        const data =
          getRoleSetMembers.data?.lookup.roleSet?.memberOrganizations;

        // Assert
        expect(data).toHaveLength(1);
        expect(res.error?.errors[0].message).toContain(
          `Agent (${baseScenario.organization.agentId}) already has assigned credential: space-member`
        );
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
      test('Error is thrown for Subspace', async () => {
        // Act
        const res = await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subspace.community.roleSetId
        );
        const data =
          roleSetMembersList.data?.lookup.roleSet?.memberOrganizations;

        // Assert
        expect(data).toHaveLength(1);
        expect(res.error?.errors[0].message).toContain(
          `Agent (${baseScenario.organization.agentId}) already has assigned credential: space-member`
        );
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
      test('Error is thrown for Subsubspace', async () => {
        // Act
        const res = await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subsubspace.community.roleSetId
        );
        const data =
          roleSetMembersList.data?.lookup.roleSet?.memberOrganizations;

        // Assert
        expect(data).toHaveLength(1);
        expect(res.error?.errors[0].message).toContain(
          `Agent (${baseScenario.organization.agentId}) already has assigned credential: space-member`
        );
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
    });
    describe('Assign different organization as member to same community', () => {
      test('Successfully assigned to Space', async () => {
        // Act
        await assignRoleToOrganization(
          newOrgId,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.space.community.roleSetId
        );
        const data =
          roleSetMembersList.data?.lookup.roleSet?.memberOrganizations;

        // Assert
        expect(data).toHaveLength(2);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
      test('Successfully assigned to Subspace', async () => {
        // Act
        await assignRoleToOrganization(
          newOrgId,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subspace.community.roleSetId
        );
        const data =
          roleSetMembersList.data?.lookup.roleSet?.memberOrganizations;

        // Assert
        expect(data).toHaveLength(2);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
      test('Successfully assigned to Subsubspace', async () => {
        // Act
        await assignRoleToOrganization(
          newOrgId,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Member
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subsubspace.community.roleSetId
        );
        const data =
          roleSetMembersList.data?.lookup.roleSet?.memberOrganizations;

        // Assert
        expect(data).toHaveLength(2);
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
    });

    describe('Assign same organization as lead to same community', () => {
      test('Error is thrown for Space', async () => {
        // Act
        const res = await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.space.community.roleSetId
        );
        const data = roleSetMembersList.data?.lookup.roleSet?.leadOrganizations;

        // Assert
        expect(data).toHaveLength(1);
        expect(res.error?.errors[0].message).toContain(
          `Agent (${baseScenario.organization.agentId}) already has assigned credential: space-lead`
        );
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
      test('Error is thrown for Subspace', async () => {
        // Act
        const res = await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subspace.community.roleSetId
        );
        const data = roleSetMembersList.data?.lookup.roleSet?.leadOrganizations;

        // Assert
        expect(data).toHaveLength(1);
        expect(res.error?.errors[0].message).toContain(
          `Agent (${baseScenario.organization.agentId}) already has assigned credential: space-lead`
        );
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
      test('Error is thrown for Subsubspace', async () => {
        // Act
        const res = await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subsubspace.community.roleSetId
        );
        const data = roleSetMembersList.data?.lookup.roleSet?.leadOrganizations;

        // Assert
        expect(data).toHaveLength(1);
        expect(res.error?.errors[0].message).toContain(
          `Agent (${baseScenario.organization.agentId}) already has assigned credential: space-lead`
        );
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: baseScenario.organization.nameId,
            }),
          ])
        );
      });
    });

    describe('Assign different organizations as lead to same community', () => {
      beforeAll(async () => {
        await assignRoleToOrganization(
          newOrgId,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Member
        );
        await assignRoleToOrganization(
          newOrgId,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Member
        );

        await assignRoleToOrganization(
          newOrgId,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Member
        );

        await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Lead
        );
        await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Lead
        );

        await assignRoleToOrganization(
          baseScenario.organization.id,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Lead
        );
      });

      // to be verified
      test.skip('Error is thrown for Space', async () => {
        // Act
        const res = await assignRoleToOrganization(
          newOrgId,
          baseScenario.space.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.space.community.roleSetId
        );
        const data = roleSetMembersList.data?.lookup.roleSet?.leadOrganizations;

        // Assert
        expect(data).toHaveLength(2);
        expect(res.error?.errors[0].message).toContain(
          "Max limit of organizations reached for role 'lead': 1, cannot assign new organization"
        );
        expect(data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              nameID: newOrgNameId,
            }),
          ])
        );
      });
      test('Two organizations assinged to Subspace', async () => {
        // Act
        await assignRoleToOrganization(
          newOrgId,
          baseScenario.subspace.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subspace.community.roleSetId
        );
        const data = roleSetMembersList.data?.lookup.roleSet?.leadOrganizations;

        // Assert
        expect(data).toHaveLength(2);
      });
      test('Two organizations assinged to Subsubspace', async () => {
        // Act
        await assignRoleToOrganization(
          newOrgId,
          baseScenario.subsubspace.community.roleSetId,
          CommunityRoleType.Lead
        );

        const roleSetMembersList = await getRoleSetMembersList(
          baseScenario.subsubspace.community.roleSetId
        );
        const data = roleSetMembersList.data?.lookup.roleSet?.leadOrganizations;

        // Assert
        expect(data).toHaveLength(2);
      });
    });
  });
});
