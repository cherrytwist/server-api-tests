import { createPostOnCallout } from '@functional-api/callout/post/post.request.params';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import {
  deleteSubspace,
  getOpportunityData,
} from '@functional-api/journey/opportunity/opportunity.request.params';
import { TestUser } from '@utils';
import { uniqueId } from '@utils/mutations/create-mutation';
import { users } from '@utils/queries/users-data';
import {
  createChallengeForOrgSpace,
  createOpportunityForChallenge,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { entitiesId } from '@test/types/entities-helper';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import { CommunityRoleType } from '@test/generated/graphql';

const organizationName = 'auth-ga-org-name' + uniqueId;
const hostNameId = 'auth-ga-org-nameid' + uniqueId;
const spaceName = 'auth-ga-eco-name' + uniqueId;
const spaceNameId = 'auth-ga-eco-nameid' + uniqueId;
const opportunityName = 'auth-ga-opp';
const challengeName = 'auth-ga-chal';

beforeAll(async () => {
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
  await createChallengeForOrgSpace(challengeName);
  await createOpportunityForChallenge(opportunityName);

  await changePreferenceSpace(
    entitiesId.spaceId,
    PreferenceType.AuthorizationAnonymousReadAccess,
    'false'
  );

  await assignRoleToUser(
    users.qaUser.id,
    entitiesId.space.communityId,
    CommunityRoleType.Member
  );

  await sendMessageToRoom(
    entitiesId.opportunity.updatesId,
    'test',
    TestUser.GLOBAL_ADMIN
  );

  await createPostOnCallout(
    entitiesId.opportunity.calloutId,
    { displayName: 'postDisplayName' },
    'postnameid',
    TestUser.GLOBAL_ADMIN
  );
});
afterAll(async () => {
  await deleteSubspace(entitiesId.opportunity.id);
  await deleteSubspace(entitiesId.challenge.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('myPrivileges - Opportunity of Public Space', () => {
  test('RegisteredUser privileges to Opportunity', async () => {
    // Act
    const response = await getOpportunityData(
      entitiesId.opportunity.id,
      TestUser.NON_HUB_MEMBER
    );

    // Assert
    expect(response.error?.errors[0].message).toContain(
      // eslint-disable-next-line prettier/prettier
      "User (non.space@alkem.io) does not have credentials that grant 'read' access to Space.opportunity"
    );
  });
});
