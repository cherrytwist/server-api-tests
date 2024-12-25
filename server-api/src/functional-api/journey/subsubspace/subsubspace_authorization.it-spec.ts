import '@utils/array.matcher';
import { createSubspace } from '../subspace/subspace.request.params';
import { deleteSpace } from '../space/space.request.params';
import { TestUser } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import {
  createSubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { CommunityRoleType } from '@generated/alkemio-schema';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { entitiesId } from '@src/types/entities-helper';
import {
  assignRoleToUserExtendedData,
  removeRoleFromUserExtendedData,
} from '../../roleset/roles-request.params';
import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();

const credentialsType = 'SPACE_ADMIN';
const subsubspaceName = `op-dname${uniqueId}`;
const subsubspaceNameId = `op-nameid${uniqueId}`;
let subsubspaceId = '';
let subsubspaceRoleSetId = '';
const subspaceName = `opp-auth-nam-ch-${uniqueId}`;
const organizationName = 'opp-auth-org-name' + uniqueId;
const hostNameId = 'opp-auth-org-nameid' + uniqueId;
const spaceName = 'opp-auth-eco-name' + uniqueId;
const spaceNameId = 'opp-auth-eco-nameid' + uniqueId;

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createSubspaceWithUsers(subspaceName);
});

beforeEach(async () => {
  const responseCreateSubsubspaceOnSubspace = await createSubspace(
    subsubspaceName,
    subsubspaceNameId,
    entitiesId.subspace.id
  );

  const oppData = responseCreateSubsubspaceOnSubspace?.data?.createSubspace;

  subsubspaceId = oppData?.id ?? '';
  subsubspaceRoleSetId = oppData?.community?.roleSet.id ?? '';
});

afterEach(async () => {
  await deleteSpace(subsubspaceId);
});

afterAll(async () => {
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Subsubspace Admin', () => {
  test('should create subsubspace admin', async () => {
    // Act
    const res = await assignRoleToUserExtendedData(
      users.subspaceMember.id,
      subsubspaceRoleSetId,
      CommunityRoleType.Admin
    );

    // Assert
    expect(res?.data?.assignRoleToUser?.agent?.credentials).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceID: subsubspaceId,
          type: credentialsType,
        }),
      ])
    );
  });

  test('should add same user as admin of 2 opportunities', async () => {
    // Arrange
    const responseOppTwo = await createSubspace(
      `oppdname-${uniqueId}`,
      `oppnameid-${uniqueId}`,
      entitiesId.subspace.id
    );
    const oppDataTwo = responseOppTwo?.data?.createSubspace;
    const subsubspaceIdTwo = oppDataTwo?.id ?? '';
    const subsubspaceRoleSetId2 = oppDataTwo?.community?.roleSet.id ?? '';

    // Act
    const resOne = await assignRoleToUserExtendedData(
      users.subspaceMember.id,
      subsubspaceRoleSetId,
      CommunityRoleType.Admin
    );

    const resTwo = await assignRoleToUserExtendedData(
      users.subsubspaceMember.id,
      subsubspaceRoleSetId2,
      CommunityRoleType.Admin
    );

    // Assert
    expect(resOne?.data?.assignRoleToUser?.agent?.credentials).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceID: subsubspaceId,
          type: credentialsType,
        }),
      ])
    );
    expect(resTwo?.data?.assignRoleToUser?.agent?.credentials).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceID: subsubspaceIdTwo,
          type: credentialsType,
        }),
      ])
    );
    await deleteSpace(subsubspaceIdTwo);
  });

  test('should be able one subsubspace admin to remove another admin from subsubspace', async () => {
    // Arrange
    await assignRoleToUserExtendedData(
      users.subspaceMember.id,
      subsubspaceRoleSetId,
      CommunityRoleType.Admin
    );

    await assignRoleToUserExtendedData(
      users.subsubspaceMember.email,
      subsubspaceRoleSetId,
      CommunityRoleType.Admin
    );

    const res = await removeRoleFromUserExtendedData(
      users.subsubspaceMember.email,
      subsubspaceRoleSetId,
      CommunityRoleType.Admin,
      TestUser.SUBSPACE_MEMBER
    );

    // Assert
    expect(res?.data?.removeRoleFromUser?.agent?.credentials).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceID: subsubspaceId,
          type: credentialsType,
        }),
      ])
    );
  });

  test('should remove the only admin of an subsubspace', async () => {
    // Arrange
    await assignRoleToUserExtendedData(
      users.subspaceMember.id,
      subsubspaceRoleSetId,
      CommunityRoleType.Admin
    );

    // Act
    const res = await removeRoleFromUserExtendedData(
      users.subsubspaceMember.email,
      subsubspaceRoleSetId,
      CommunityRoleType.Admin,
      TestUser.SUBSPACE_MEMBER
    );

    // Assert
    expect(res?.data?.removeRoleFromUser?.agent?.credentials).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceID: subsubspaceId,
          type: credentialsType,
        }),
      ])
    );
  });
});
