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
  createOpportunityForSubspace,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import { createSubsubspace } from '@utils/mutations/journeys/subsubspace';
import { uniqueId } from '@utils/uniqueId';

let opportunityName = '';
let opportunityNameId = '';
let opportunityId = '';
let additionalOpportunityId: string;
let subspaceName = '';
let additionalSubspaceId = '';
const organizationName = 'opp-org-name' + uniqueId;
const hostNameId = 'opp-org-nameid' + uniqueId;
const spaceName = 'opp-eco-name' + uniqueId;
const spaceNameId = 'opp-eco-nameid' + uniqueId;

beforeEach(async () => {
  subspaceName = `testSubspace ${uniqueId}`;
  opportunityName = `opportunityName ${uniqueId}`;
  opportunityNameId = `op${uniqueId}`;
});

beforeAll(async () => {
  opportunityName = 'post-opp';
  subspaceName = 'post-chal';
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
  await createSubspaceForOrgSpace(subspaceName);
  await createOpportunityForSubspace(opportunityName);
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
    await deleteSpace(opportunityId);
  });

  test('should create opportunity and query the data', async () => {
    // Act
    // Create Opportunity
    const responseCreateOpportunityOnSubspace = await createSubspace(
      opportunityName,
      opportunityNameId,
      entitiesId.subspace.id
    );
    const createOpportunityData =
      responseCreateOpportunityOnSubspace?.data?.createSubspace;

    opportunityId = createOpportunityData?.id ?? '';

    // Query Opportunity data
    const requestQueryOpportunity = await getSubspaceData(
      entitiesId.spaceId,
      opportunityId
    );
    const requestOpportunityData =
      requestQueryOpportunity?.data?.space.subspace;

    // Assert
    expect(createOpportunityData).toEqual(requestOpportunityData);
  });

  test('should update opportunity and query the data', async () => {
    // Arrange
    // Create Opportunity on Subspace
    const responseCreateOpportunityOnSubspace = await createSubspace(
      opportunityName,
      opportunityNameId,
      entitiesId.subspace.id
    );

    opportunityId =
      responseCreateOpportunityOnSubspace?.data?.createSubspace.id ?? '';
    // Act
    // Update the created Opportunity
    const responseUpdateOpportunity = await updateSpaceContext(opportunityId);
    const updateOpportunityData = responseUpdateOpportunity?.data?.updateSpace;

    // Query Opportunity data
    const requestQueryOpportunity = await getSubspaceData(
      entitiesId.spaceId,
      opportunityId
    );
    const requestOpportunityData =
      requestQueryOpportunity?.data?.space.subspace;

    // Assert
    expect(updateOpportunityData?.profile).toEqual(
      requestOpportunityData?.profile
    );
    expect(updateOpportunityData?.context).toEqual(
      requestOpportunityData?.context
    );
  });

  test('should remove opportunity and query the data', async () => {
    // Arrange
    // Create Opportunity
    const responseCreateOpportunityOnSubspace = await createSubspace(
      opportunityName,
      opportunityNameId,
      entitiesId.subspace.id
    );
    opportunityId =
      responseCreateOpportunityOnSubspace?.data?.createSubspace.id ?? '';

    // Act
    // Remove opportunity
    const removeOpportunityResponse = await deleteSpace(opportunityId);

    // Query Opportunity data
    const requestQueryOpportunity = await getSubspaceData(
      entitiesId.spaceId,
      opportunityId
    );

    // Assert
    expect(responseCreateOpportunityOnSubspace.status).toBe(200);
    expect(removeOpportunityResponse?.data?.deleteSpace.id ?? '').toEqual(
      opportunityId
    );
    expect(requestQueryOpportunity?.error?.errors[0].message).toEqual(
      `Unable to find subspace with ID: '${opportunityId}'`
    );
  });

  test('should throw an error for creating opportunity with same name/NameId on different subspaces', async () => {
    // Arrange
    const responseCreateSubspaceTwo = await createSubspace(
      `${subspaceName}ch`,
      `${uniqueId}ch`,
      entitiesId.spaceId
    );
    additionalSubspaceId =
      responseCreateSubspaceTwo?.data?.createSubspace.id ?? '';

    // Act
    // Create Opportunity on Challange One
    const responseCreateOpportunityOnSubspaceOne = await createSubspace(
      opportunityName,
      `${opportunityNameId}new`,
      entitiesId.subspace.id
    );
    opportunityId =
      responseCreateOpportunityOnSubspaceOne?.data?.createSubspace.id ?? '';

    const responseCreateOpportunityOnSubspaceTwo = await createSubsubspace(
      opportunityName,
      `${opportunityNameId}new`,
      additionalSubspaceId
    );

    // Assert
    expect(responseCreateOpportunityOnSubspaceOne.status).toBe(200);
    expect(
      responseCreateOpportunityOnSubspaceTwo?.error?.errors[0].message
    ).toContain(
      `Unable to create entity: the provided nameID is already taken: ${opportunityNameId}new`
    );
  });
});

describe('DDT should not create opportunities with same nameID within the same subspace', () => {
  afterAll(async () => {
    await deleteSpace(additionalOpportunityId);
  });
  // Arrange
  test.each`
    opportunityDisplayName | opportunityNameIdD | expected
    ${'opp name a'}        | ${'opp-nameid-a'}  | ${'nameID":"opp-nameid-a'}
    ${'opp name b'}        | ${'opp-nameid-a'}  | ${'Unable to create entity: the provided nameID is already taken: opp-nameid-a'}
  `(
    'should expect: "$expected" for opportunity creation with name: "$opportunityDisplayName" and nameID: "$opportunityNameIdD"',
    async ({ opportunityDisplayName, opportunityNameIdD, expected }) => {
      // Act
      // Create Opportunity
      const responseCreateOpportunityOnSubspace = await createSubspace(
        opportunityDisplayName,
        opportunityNameIdD,
        entitiesId.subspace.id
      );
      const responseData = JSON.stringify(
        responseCreateOpportunityOnSubspace
      ).replace('\\', '');

      if (!responseCreateOpportunityOnSubspace?.error) {
        additionalOpportunityId =
          responseCreateOpportunityOnSubspace?.data?.createSubspace.id ?? '';
      }

      // Assert
      expect(responseData).toContain(expected);
    }
  );
});
