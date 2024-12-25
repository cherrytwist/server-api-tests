import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import { deleteSpace } from '../../journey/space/space.request.params';
import {
  createSubspaceForOrgSpace,
  createSubsubspaceForSubspace,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import {
  assignRoleToOrganization,
  getOrganizationRole,
} from '../roles-request.params';
import { baseScenario } from '../../../types/entities-helper';
import { CommunityRoleType } from '@generated/graphql';
import { deleteOrganization } from '../../contributor-management/organization/organization.request.params';

const organizationName = 'orole-org-name' + uniqueId;
const hostNameId = 'orole-org-nameid' + uniqueId;
const spaceName = 'orole-eco-name' + uniqueId;
const spaceNameId = 'orole-eco-nameid' + uniqueId;
const subsubspaceName = 'orole-opp';
const subspaceName = 'orole-chal';
const spaceRoles = ['lead', 'member'];
const availableRoles = ['member', 'lead'];

beforeAll(async () => {
  await deleteSpace('eco1');

  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
  await createSubspaceForOrgSpace(subspaceName);
  await createSubsubspaceForSubspace(subsubspaceName);

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.space.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subspace.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subsubspace.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.space.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subsubspace.roleSetId,
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
          nameID: spaceNameId,
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
