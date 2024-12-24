import '@utils/array.matcher';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { deleteSpace, updateSpaceContext } from '../space/space.request.params';
import {
  createSubspace,
  getSubspaceData,
} from '../subspace/subspace.request.params';
import { entitiesId } from '@src/types/entities-helper';
import {
  createSubspaceForOrgSpace,
  createSubsubspaceForSubspace,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import { createSubsubspace } from '@src/graphql/mutations/journeys/subsubspace';
import { uniqueId } from '@utils/uniqueId';

let subsubspaceName = '';
let subsubspaceNameId = '';
let subsubspaceId = '';
let additionalSubsubspaceId: string;
let subspaceName = '';
let additionalSubspaceId = '';
const organizationName = 'opp-org-name' + uniqueId;
const hostNameId = 'opp-org-nameid' + uniqueId;
const spaceName = 'opp-eco-name' + uniqueId;
const spaceNameId = 'opp-eco-nameid' + uniqueId;

beforeEach(async () => {
  subspaceName = `testSubspace ${uniqueId}`;
  subsubspaceName = `subsubspaceName ${uniqueId}`;
  subsubspaceNameId = `op${uniqueId}`;
});

beforeAll(async () => {
  subsubspaceName = 'post-opp';
  subspaceName = 'post-chal';
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
  await createSubspaceForOrgSpace(subspaceName);
  await createSubsubspaceForSubspace(subsubspaceName);
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(additionalSubspaceId);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Opportunities', () => {
  afterEach(async () => {
    await deleteSpace(subsubspaceId);
  });

  test('should create subsubspace and query the data', async () => {
    // Act
    // Create Subsubspace
    const responseCreateSubsubspaceOnSubspace = await createSubspace(
      subsubspaceName,
      subsubspaceNameId,
      entitiesId.subspace.id
    );
    const createSubsubspaceData =
      responseCreateSubsubspaceOnSubspace?.data?.createSubspace;

    subsubspaceId = createSubsubspaceData?.id ?? '';

    // Query Subsubspace data
    const requestQuerySubsubspace = await getSubspaceData(
      entitiesId.spaceId,
      subsubspaceId
    );
    const requestSubsubspaceData =
      requestQuerySubsubspace?.data?.space.subspace;

    // Assert
    expect(createSubsubspaceData).toEqual(requestSubsubspaceData);
  });

  test('should update subsubspace and query the data', async () => {
    // Arrange
    // Create Subsubspace on Subspace
    const responseCreateSubsubspaceOnSubspace = await createSubspace(
      subsubspaceName,
      subsubspaceNameId,
      entitiesId.subspace.id
    );

    subsubspaceId =
      responseCreateSubsubspaceOnSubspace?.data?.createSubspace.id ?? '';
    // Act
    // Update the created Subsubspace
    const responseUpdateSubsubspace = await updateSpaceContext(subsubspaceId);
    const updateSubsubspaceData = responseUpdateSubsubspace?.data?.updateSpace;

    // Query Subsubspace data
    const requestQuerySubsubspace = await getSubspaceData(
      entitiesId.spaceId,
      subsubspaceId
    );
    const requestSubsubspaceData =
      requestQuerySubsubspace?.data?.space.subspace;

    // Assert
    expect(updateSubsubspaceData?.profile).toEqual(
      requestSubsubspaceData?.profile
    );
    expect(updateSubsubspaceData?.context).toEqual(
      requestSubsubspaceData?.context
    );
  });

  test('should remove subsubspace and query the data', async () => {
    // Arrange
    // Create Subsubspace
    const responseCreateSubsubspaceOnSubspace = await createSubspace(
      subsubspaceName,
      subsubspaceNameId,
      entitiesId.subspace.id
    );
    subsubspaceId =
      responseCreateSubsubspaceOnSubspace?.data?.createSubspace.id ?? '';

    // Act
    // Remove subsubspace
    const removeSubsubspaceResponse = await deleteSpace(subsubspaceId);

    // Query Subsubspace data
    const requestQuerySubsubspace = await getSubspaceData(
      entitiesId.spaceId,
      subsubspaceId
    );

    // Assert
    expect(responseCreateSubsubspaceOnSubspace.status).toBe(200);
    expect(removeSubsubspaceResponse?.data?.deleteSpace.id ?? '').toEqual(
      subsubspaceId
    );
    expect(requestQuerySubsubspace?.error?.errors[0].message).toEqual(
      `Unable to find subspace with ID: '${subsubspaceId}'`
    );
  });

  test('should throw an error for creating subsubspace with same name/NameId on different subspaces', async () => {
    // Arrange
    const responseCreateSubspaceTwo = await createSubspace(
      `${subspaceName}ch`,
      `${uniqueId}ch`,
      entitiesId.spaceId
    );
    additionalSubspaceId =
      responseCreateSubspaceTwo?.data?.createSubspace.id ?? '';

    // Act
    // Create Subsubspace on Challange One
    const responseCreateSubsubspaceOnSubspaceOne = await createSubspace(
      subsubspaceName,
      `${subsubspaceNameId}new`,
      entitiesId.subspace.id
    );
    subsubspaceId =
      responseCreateSubsubspaceOnSubspaceOne?.data?.createSubspace.id ?? '';

    const responseCreateSubsubspaceOnSubspaceTwo = await createSubsubspace(
      subsubspaceName,
      `${subsubspaceNameId}new`,
      additionalSubspaceId
    );

    // Assert
    expect(responseCreateSubsubspaceOnSubspaceOne.status).toBe(200);
    expect(
      responseCreateSubsubspaceOnSubspaceTwo?.error?.errors[0].message
    ).toContain(
      `Unable to create entity: the provided nameID is already taken: ${subsubspaceNameId}new`
    );
  });
});

describe('DDT should not create opportunities with same nameID within the same subspace', () => {
  afterAll(async () => {
    await deleteSpace(additionalSubsubspaceId);
  });
  // Arrange
  test.each`
    subsubspaceDisplayName | subsubspaceNameIdD | expected
    ${'opp name a'}        | ${'opp-nameid-a'}  | ${'nameID":"opp-nameid-a'}
    ${'opp name b'}        | ${'opp-nameid-a'}  | ${'Unable to create entity: the provided nameID is already taken: opp-nameid-a'}
  `(
    'should expect: "$expected" for subsubspace creation with name: "$subsubspaceDisplayName" and nameID: "$subsubspaceNameIdD"',
    async ({ subsubspaceDisplayName, subsubspaceNameIdD, expected }) => {
      // Act
      // Create Subsubspace
      const responseCreateSubsubspaceOnSubspace = await createSubspace(
        subsubspaceDisplayName,
        subsubspaceNameIdD,
        entitiesId.subspace.id
      );
      const responseData = JSON.stringify(
        responseCreateSubsubspaceOnSubspace
      ).replace('\\', '');

      if (!responseCreateSubsubspaceOnSubspace?.error) {
        additionalSubsubspaceId =
          responseCreateSubsubspaceOnSubspace?.data?.createSubspace.id ?? '';
      }

      // Assert
      expect(responseData).toContain(expected);
    }
  );
});
