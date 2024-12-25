import { deleteSpace } from '../../journey/space/space.request.params';
import {
  assignRoleToOrganization,
  getOrganizationRole,
} from '../roles-request.params';
import { CommunityRoleType } from '@generated/graphql';
import { deleteOrganization } from '../../contributor-management/organization/organization.request.params';

import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';

const spaceRoles = ['lead', 'member'];
const availableRoles = ['member', 'lead'];

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  await deleteSpace('eco1');

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

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.space.community.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subspace.community.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.space.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

describe('Organization role', () => {
  test('Organization role - assignment to 1 Organization, Space, Subspace, Subsubspace', async () => {
    // Act
    const res = await getOrganizationRole(baseScenario.organization.id);
    const spacesData = res?.data?.rolesOrganization.spaces ?? [];

    // Assert
    expect(spacesData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nameID: baseScenario.space.nameId,
          roles: expect.arrayContaining(spaceRoles),
        }),
      ])
    );

    expect(spacesData[0].subspaces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nameID: baseScenario.subspace.nameId,
          roles: expect.arrayContaining(availableRoles),
        }),
      ])
    );
    // expect(spacesData[0].subspaces).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       nameID: entitiesId.subsubspace.nameId,
    //       roles: expect.arrayContaining(availableRoles),
    //     }),
    //   ])
    // );
  });
});
