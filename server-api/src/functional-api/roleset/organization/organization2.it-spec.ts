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
import { entitiesId } from '../../../types/entities-helper';
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
    entitiesId.organization.id,
    entitiesId.space.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    entitiesId.organization.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    entitiesId.organization.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Member
  );

  await assignRoleToOrganization(
    entitiesId.organization.id,
    entitiesId.space.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToOrganization(
    entitiesId.organization.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToOrganization(
    entitiesId.organization.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Organization role', () => {
  test('Organization role - assignment to 1 Organization, Space, Subspace, Subsubspace', async () => {
    // Act
    const res = await getOrganizationRole(entitiesId.organization.id);
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
          nameID: entitiesId.subspace.nameId,
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
