import '@utils/array.matcher';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { deleteSpace, updateSpaceContext } from '../space/space.request.params';
import {
  createSubspace,
  getSubspaceData,
} from '../subspace/subspace.request.params';
import { createSubsubspace } from '@src/graphql/mutations/journeys/subsubspace';
import { UniqueIDGenerator } from '@alkemio/tests-lib';import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';
;
const uniqueId = UniqueIDGenerator.getID();

let subsubspaceName = '';
let subsubspaceNameId = '';
let subsubspaceId = '';
let additionalSubsubspaceId: string;
let additionalSubspaceId = '';

beforeEach(async () => {
  subsubspaceName = `subsubspaceName ${uniqueId}`;
  subsubspaceNameId = `op${uniqueId}`;
});

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  baseScenario = await OrganizationWithSpaceModelFactory.createOrganizationWithSpace();

  await OrganizationWithSpaceModelFactory.createSubspace(baseScenario.space.id, 'subspace', baseScenario.subspace);
  await OrganizationWithSpaceModelFactory.createSubspace(baseScenario.subspace.id, 'subsubspace', baseScenario.subsubspace);

  subsubspaceName = 'post-opp';
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(additionalSubspaceId);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
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
      baseScenario.subspace.id
    );
    const createSubsubspaceData =
      responseCreateSubsubspaceOnSubspace?.data?.createSubspace;

    subsubspaceId = createSubsubspaceData?.id ?? '';

    // Query Subsubspace data
    const requestQuerySubsubspace = await getSubspaceData(
      baseScenario.space.id,
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
      baseScenario.subspace.id
    );

    subsubspaceId =
      responseCreateSubsubspaceOnSubspace?.data?.createSubspace.id ?? '';
    // Act
    // Update the created Subsubspace
    const responseUpdateSubsubspace = await updateSpaceContext(subsubspaceId);
    const updateSubsubspaceData = responseUpdateSubsubspace?.data?.updateSpace;

    // Query Subsubspace data
    const requestQuerySubsubspace = await getSubspaceData(
      baseScenario.space.id,
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
      baseScenario.subspace.id
    );
    subsubspaceId =
      responseCreateSubsubspaceOnSubspace?.data?.createSubspace.id ?? '';

    // Act
    // Remove subsubspace
    const removeSubsubspaceResponse = await deleteSpace(subsubspaceId);

    // Query Subsubspace data
    const requestQuerySubsubspace = await getSubspaceData(
      baseScenario.space.id,
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
      `${subsubspaceName}ch`,
      `${uniqueId}ch`,
      baseScenario.space.id
    );
    additionalSubspaceId =
      responseCreateSubspaceTwo?.data?.createSubspace.id ?? '';

    // Act
    // Create Subsubspace on Challange One
    const responseCreateSubsubspaceOnSubspaceOne = await createSubspace(
      subsubspaceName,
      `${subsubspaceNameId}new`,
      baseScenario.subspace.id
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
        baseScenario.subspace.id
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
