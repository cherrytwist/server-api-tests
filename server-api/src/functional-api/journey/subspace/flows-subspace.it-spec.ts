import { createSubspace, getSubspaceData } from './subspace.request.params';
import '@utils/array.matcher';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { deleteSpace, updateSpaceContext } from '../space/space.request.params';
import { entitiesId } from '@src/types/entities-helper';
import { createOrgAndSpace } from '@utils/data-setup/entities';
import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();

let subspaceName = '';
let subspaceId = '';
let additionalSubspaceId = '';
const organizationName = 'flowch-org-name' + uniqueId;
const hostNameId = 'flowch-org-nameid' + uniqueId;
const spaceName = 'flowch-sp-name' + uniqueId;
const spaceNameId = 'flowch-sp-nameid' + uniqueId;

beforeAll(async () => {
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
});

afterAll(async () => {
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

beforeEach(async () => {
  subspaceName = `fl-ch-dname-${uniqueId}`;

  const responseCreateSubspace = await createSubspace(
    subspaceName,
    uniqueId,
    entitiesId.spaceId
  );
  subspaceId = responseCreateSubspace.data?.createSubspace.id ?? '';
});

afterEach(async () => {
  await deleteSpace(subspaceId);
});

describe('Flows subspace', () => {
  // ToDo - update test - failing when run in parallel with other suites
  test.skip('should not result unassigned users to a subspace', async () => {
    // Act
    const responseGroupQuery = await getSubspaceData(
      entitiesId.spaceId,
      subspaceId
    );

    // Assert
    expect(responseGroupQuery.status).toBe(200);
    expect(
      responseGroupQuery.data?.space.subspace?.community?.roleSet.memberUsers
    ).toHaveLength(1);
    expect(
      responseGroupQuery.data?.space.subspace?.community?.roleSet.leadUsers
    ).toHaveLength(1);
  });

  test('should  modify subspace name to allready existing subspace name and/or textId', async () => {
    // Arrange
    // Create second subspace and get its id and name
    const responseSecondSubspace = await createSubspace(
      subspaceName + subspaceName,
      uniqueId + uniqueId,
      entitiesId.spaceId
    );
    const secondsubspaceName =
      responseSecondSubspace.data?.createSubspace.profile.displayName ?? '';
    additionalSubspaceId =
      responseSecondSubspace.data?.createSubspace.id ?? '';

    // Act
    const responseUpdateSubspace = await updateSpaceContext(
      subspaceId,
      secondsubspaceName,
      {
        vision: 'test vision update',
        impact: 'test impact update',
        who: 'test who update',
      }
    );

    // Assert
    expect(responseUpdateSubspace.status).toBe(200);
    expect(
      responseUpdateSubspace.data?.updateSpace.profile.displayName
    ).toEqual(secondsubspaceName);
    await deleteSpace(additionalSubspaceId);
  });

  test('should creating 2 subspaces with same name', async () => {
    // Act
    // Create second subspace with same name
    const response = await createSubspace(
      subspaceName,
      `${uniqueId}-2`,
      entitiesId.spaceId
    );
    const subspaceData = response.data?.createSubspace;
    additionalSubspaceId = subspaceData?.id ?? '';

    // Assert
    expect(subspaceData?.profile.displayName).toContain(subspaceName);
    await deleteSpace(additionalSubspaceId);
  });

  test('should throw error - creating 2 subspaces with different name and same nameId', async () => {
    // Act
    // Create second subspace with same textId
    const response = await createSubspace(
      subspaceName + subspaceName,
      uniqueId,
      entitiesId.spaceId
    );
    // Assert
    expect(JSON.stringify(response)).toContain(
      `Unable to create entity: the provided nameID is already taken: ${uniqueId}`
    );
  });
});
