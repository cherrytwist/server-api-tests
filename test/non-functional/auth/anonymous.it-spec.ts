import { dataGenerator } from '@test/utils/data-generator';
import { createVariablesGetter, getMutation } from '@test/utils/getters';
import { mutationNoAuth } from '../../utils/graphql.request';

const notAuthorizedCode = '"code":"UNAUTHENTICATED"';
const forbiddenCode = '"code":"FORBIDDEN"';
const userNotRegistered = 'USER_NOT_REGISTERED';
let ecoverseId: string;

let getVariables: (operationName: string) => string;

beforeAll(async done => {
  let DataModel = await dataGenerator();
  ecoverseId = DataModel.ecoverseId;

  getVariables = createVariablesGetter({
    userId: DataModel.userId,
    userIdTwo: DataModel.userIdTwo,
    selfUserId: DataModel.selfUserId,
    applicationId: DataModel.applicationId,
    applicationIdAnotherUser: DataModel.applicationIdAnotherUser,
    userProfileId: DataModel.userProfileId,
    organisationId: DataModel.organisationId,
    organisationIdDel: DataModel.organisationIdDel,
    ecoverseId: DataModel.ecoverseId,
    ecoverseCommunityId: DataModel.ecoverseCommunityId,
    ecoverseGroupyId: DataModel.ecoverseGroupyId,
    challengeId: DataModel.challengeId,
    opportunityId: DataModel.opportunityId,
    contextId: DataModel.contextId,
    ecosystemModelId: DataModel.ecosystemModelId,
    actorGroupId: DataModel.actorGroupId,
    actorId: DataModel.actorId,
    aspectId: DataModel.aspectId,
    relationId: DataModel.relationId,
    referenceId: DataModel.referenceId,
    projectId: DataModel.projectId,
  });

  done();
});
describe.skip('', () => {
describe('GlobalRegistered - Create Mutation', () => {
  test.each`
    operation                      | expected
    ${'createUser'}                | ${notAuthorizedCode}
    ${'createOrganisation'}        | ${notAuthorizedCode}
    ${'createEcoverse'}            | ${notAuthorizedCode}
    ${'createChallenge'}           | ${notAuthorizedCode}
    ${'createChildChallenge'}      | ${notAuthorizedCode}
    ${'createOpportunity'}         | ${notAuthorizedCode}
    ${'createProject'}             | ${notAuthorizedCode}
    ${'createAspect'}              | ${notAuthorizedCode}
    ${'createActorGroup'}          | ${notAuthorizedCode}
    ${'createActor'}               | ${notAuthorizedCode}
    ${'createGroupOnOrganisation'} | ${notAuthorizedCode}
    ${'createGroupOnCommunity'}    | ${notAuthorizedCode}
    ${'createReferenceOnContext'}  | ${notAuthorizedCode}
    ${'createReferenceOnProfile'}  | ${notAuthorizedCode}
    ${'createTagsetOnProfile'}     | ${notAuthorizedCode}
    ${'createRelation'}            | ${notAuthorizedCode}
    ${'createApplication'}         | ${notAuthorizedCode}
    ${'createApplicationSelfUser'} | ${notAuthorizedCode}
  `('$operation', async ({ operation, expected }) => {
    const response = await mutationNoAuth(
      getMutation(operation),
      getVariables(operation)
    );

    const responseData = JSON.stringify(response.body).replace('\\', '');
    expect(response.status).toBe(200);
    expect(responseData).not.toContain(expected);
    expect(responseData).not.toContain(forbiddenCode);
    expect(responseData).not.toContain(userNotRegistered);
  });
});

describe('GlobalRegistered - Update Mutation', () => {
  test.each`
    operation               | expected
    ${'updateActor'}        | ${notAuthorizedCode}
    ${'updateAspect'}       | ${notAuthorizedCode}
    ${'updateChallenge'}    | ${notAuthorizedCode}
    ${'updateOpportunity'}  | ${notAuthorizedCode}
    ${'updateEcoverse'}     | ${notAuthorizedCode}
    ${'updateOrganisation'} | ${notAuthorizedCode}
    ${'updateProfile'}      | ${notAuthorizedCode}
    ${'updateProject'}      | ${notAuthorizedCode}
    ${'updateUser'}         | ${notAuthorizedCode}
    ${'updateUserSelf'}     | ${notAuthorizedCode}
    ${'updateUserGroup'}    | ${notAuthorizedCode}
  `('$operation', async ({ operation, expected }) => {
    const response = await mutationNoAuth(
      getMutation(operation),
      getVariables(operation)
    );

    const responseData = JSON.stringify(response.body).replace('\\', '');
    expect(response.status).toBe(200);
    expect(responseData).not.toContain(expected);
    expect(responseData).not.toContain(forbiddenCode);
    expect(responseData).not.toContain(userNotRegistered);
  });
});

describe('GlobalRegistered - Assign / Remove Mutation', () => {
  test.each`
    operation                    | expected
    ${'assignUserToCommunity'}   | ${notAuthorizedCode}
    ${'removeUserFromCommunity'} | ${notAuthorizedCode}
    ${'assignUserToGroup'}       | ${notAuthorizedCode}
    ${'removeUserFromGroup'}     | ${notAuthorizedCode}
  `('$operation', async ({ operation, expected }) => {
    const response = await mutationNoAuth(
      getMutation(operation),
      getVariables(operation)
    );

    const responseData = JSON.stringify(response.body).replace('\\', '');
    expect(response.status).toBe(200);
    expect(responseData).not.toContain(expected);
    expect(responseData).not.toContain(forbiddenCode);
    expect(responseData).not.toContain(userNotRegistered);
  });
});

describe('GlobalRegistered - Event Mutation', () => {
  test.each`
    operation               | expected
    ${'eventOnChallenge'}   | ${notAuthorizedCode}
    ${'eventOnOpportunity'} | ${notAuthorizedCode}
    ${'eventOnProject'}     | ${notAuthorizedCode}
    ${'eventOnApplication'} | ${notAuthorizedCode}
  `('$operation', async ({ operation, expected }) => {
    const response = await mutationNoAuth(
      getMutation(operation),
      getVariables(operation)
    );

    const responseData = JSON.stringify(response.body).replace('\\', '');
    expect(response.status).toBe(200);
    expect(responseData).not.toContain(expected);
    expect(responseData).not.toContain(forbiddenCode);
    expect(responseData).not.toContain(userNotRegistered);
  });
});

describe('GlobalRegistered - Grant/Revoke Mutation', () => {
  test.each`
    operation                     | expected
    ${'grantCredentialToUser'}    | ${notAuthorizedCode}
    ${'revokeCredentialFromUser'} | ${notAuthorizedCode}
  `('$operation', async ({ operation, expected }) => {
    const response = await mutationNoAuth(
      getMutation(operation),
      getVariables(operation)
    );

    const responseData = JSON.stringify(response.body).replace('\\', '');
    expect(response.status).toBe(200);
    expect(responseData).not.toContain(expected);
    expect(responseData).not.toContain(forbiddenCode);
    expect(responseData).not.toContain(userNotRegistered);
  });
});

describe('GlobalRegistered - Delete Mutation', () => {
  test.each`
    operation                             | expected
    ${'deleteActor'}                      | ${notAuthorizedCode}
    ${'deleteActorGroup'}                 | ${notAuthorizedCode}
    ${'deleteUserGroup'}                  | ${notAuthorizedCode}
    ${'deleteUserApplication'}            | ${notAuthorizedCode}
    ${'deleteUserApplicationAnotherUser'} | ${notAuthorizedCode}
    ${'deleteUser'}                       | ${notAuthorizedCode}
    ${'deleteRelation'}                   | ${notAuthorizedCode}
    ${'deleteReference'}                  | ${notAuthorizedCode}
    ${'deleteProject'}                    | ${notAuthorizedCode}
    ${'deleteAspect'}                     | ${notAuthorizedCode}
    ${'deleteOpportunity'}                | ${notAuthorizedCode}
    ${'deleteChallenge'}                  | ${notAuthorizedCode}
    ${'deleteEcoverse'}                   | ${notAuthorizedCode}
    ${'deleteOrganisation'}               | ${notAuthorizedCode}
  `('$operation', async ({ operation, expected }) => {
    const response = await mutationNoAuth(
      getMutation(operation),
      getVariables(operation)
    );

    const responseData = JSON.stringify(response.body).replace('\\', '');
    expect(response.status).toBe(200);
    expect(responseData).not.toContain(expected);
    expect(responseData).not.toContain(forbiddenCode);
    expect(responseData).not.toContain(userNotRegistered);
  });
});
});