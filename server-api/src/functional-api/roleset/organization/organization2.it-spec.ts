import { deleteSpace } from '../../journey/space/space.request.params';
import {
  assignRoleToOrganization,
  getOrganizationRole,
} from '../roles-request.params';
import { CommunityRoleType } from '@generated/graphql';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';

const spaceRoles = ['lead', 'member'];
const availableRoles = ['member', 'lead'];

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'subspace-activity',
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
  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);

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
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
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
