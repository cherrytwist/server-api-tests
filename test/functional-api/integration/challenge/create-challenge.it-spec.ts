import {
  createChallangeMutation,
  getChallengeData,
  getChallengesData,
  removeChallangeMutation,
} from './challenge.request.params';
import '../../../utils/array.matcher';
import {
  createTestEcoverse,
  ecoverseName,
  ecoverseNameId,
  removeEcoverseMutation,
} from '../ecoverse/ecoverse.request.params';
import {
  createOrganisationMutation,
  deleteOrganisationMutation,
  hostNameId,
  organisationName,
} from '../organisation/organisation.request.params';

let challengeName = '';
let uniqueTextId = '';
let challengeId = '';
let additionalChallengeId = '';
let ecoverseId = '';
let organisationId = '';

const challangeData = async (challengeId: string): Promise<string> => {
  const responseQuery = await getChallengeData(challengeId);
  const response = responseQuery.body.data.ecoverse.challenge;
  return response;
};

const challengesList = async (): Promise<string> => {
  const responseQuery = await getChallengesData();
  const response = responseQuery.body.data.ecoverse.challenges;
  return response;
};

beforeAll(async () => {
  const responseOrg = await createOrganisationMutation(
    organisationName,
    hostNameId
  );
  organisationId = responseOrg.body.data.createOrganisation.id;
  let responseEco = await createTestEcoverse(
    ecoverseName,
    ecoverseNameId,
    organisationId
  );
  ecoverseId = responseEco.body.data.createEcoverse.id;
});

afterAll(async () => {
  await removeEcoverseMutation(ecoverseId);
  await deleteOrganisationMutation(organisationId);
});

beforeEach(async () => {
  uniqueTextId = Math.random()
    .toString(36)
    .slice(-6);
  challengeName = `testChallenge ${uniqueTextId}`;
  const response = await createChallangeMutation(
    challengeName + 'xxx',
    uniqueTextId,
    ecoverseId
  );
  challengeId = response.body.data.createChallenge.id;
});

afterEach(async () => {
  await removeChallangeMutation(challengeId);
  await removeChallangeMutation(additionalChallengeId);
});

describe('Create Challenge', () => {
  test('should create a successfull challenge', async () => {
    // Act
    const response = await createChallangeMutation(
      'challengeName',
      'chal-texti',
      ecoverseId
    );
    const challengeDataCreate = response.body.data.createChallenge;
    additionalChallengeId = response.body.data.createChallenge.id;

    // Assert
    expect(response.status).toBe(200);
    expect(challengeDataCreate.displayName).toEqual('challengeName');
    expect(challengeDataCreate).toEqual(
      await challangeData(additionalChallengeId)
    );
  });

  test('should remove a challenge', async () => {
    // Arrange
    const challangeDataBeforeRemove = await challangeData(challengeId);

    // Act
    const removeChallengeResponse = await removeChallangeMutation(challengeId);

    // Assert
    expect(removeChallengeResponse.status).toBe(200);
    expect(removeChallengeResponse.body.data.deleteChallenge.id).toEqual(
      challengeId
    );
    expect(await challengesList()).not.toContainObject(
      challangeDataBeforeRemove
    );
  });

  test('should create 2 challenges with different names and textIDs', async () => {
    // Act
    const responseChallengeTwo = await createChallangeMutation(
      //  ecoverseId,
      `${challengeName}change`,
      `${uniqueTextId}c`,
      ecoverseId
    );
    additionalChallengeId = responseChallengeTwo.body.data.createChallenge.id;

    // Assert
    expect(await challengesList()).toContainObject(
      await challangeData(challengeId)
    );
    expect(await challengesList()).toContainObject(
      await challangeData(additionalChallengeId)
    );
  });

  test('should create challenge with name and textId only', async () => {
    // Act
    const responseSimpleChallenge = await createChallangeMutation(
      // ecoverseId,
      `${challengeName}change`,
      `${uniqueTextId}c`,
      ecoverseId
    );
    additionalChallengeId =
      responseSimpleChallenge.body.data.createChallenge.id;

    // Assert
    expect(await challengesList()).toContainObject(
      await challangeData(additionalChallengeId)
    );
  });

  test('should create a group, when create a challenge', async () => {
    // // Arrange
    const responseChallenge = await createChallangeMutation(
      // ecoverseId,
      challengeName + 'd',
      uniqueTextId + 'd',
      ecoverseId
    );

    // Act
    additionalChallengeId = responseChallenge.body.data.createChallenge.id;

    // Assert
    expect(responseChallenge.status).toBe(200);
    expect(
      responseChallenge.body.data.createChallenge.community.displayName
    ).toEqual(challengeName + 'd');
    expect(
      responseChallenge.body.data.createChallenge.community.id
    ).not.toBeNull();
  });

  // to be discussed
  describe('DDT invalid textId', () => {
    // Arrange
    test.each`
      nameId       | expected
      ${'d'}       | ${'Expected type \\"NameID\\". NameID value not valid: d'}
      ${'vvv,vvd'} | ${'Expected type \\"NameID\\". NameID value not valid: vvv,vvd'}
      ${'..-- d'}  | ${'Expected type \\"NameID\\". NameID value not valid: ..-- d'}
    `(
      'should throw error: "$expected" for nameId value: "$nameId"',
      async ({ nameId, expected }) => {
        const response = await createChallangeMutation(
          challengeName + 'd',
          nameId + 'd',
          ecoverseId
        );

        // Assert
        expect(response.text).toContain(expected);
      }
    );
  });
});