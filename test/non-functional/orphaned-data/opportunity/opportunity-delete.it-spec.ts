import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { deleteSubspace } from '@functional-api/journey/opportunity/opportunity.request.params';
import { TestUser } from '@utils/test.user';
import { uniqueId } from '@utils/mutations/create-mutation';
import {
  createChallengeWithUsers,
  createOpportunityForChallenge,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { createCalloutOnCollaboration } from '@functional-api/callout/callouts.request.params';
import { createWhiteboardOnCallout } from '@functional-api/callout/call-for-whiteboards/whiteboard-collection-callout.params.request';
import { createPostOnCallout } from '@functional-api/callout/post/post.request.params';

import { entitiesId } from '@test/types/entities-helper';
import {
  assignRoleToUser,
  assignRoleToOrganization,
} from '@functional-api/roleset/roles-request.params';
import { users } from '@utils/queries/users-data';
import { CommunityRoleType } from '@generated/graphql';

const organizationName = 'post-org-name' + uniqueId;
const hostNameId = 'post-org-nameid' + uniqueId;
const spaceName = 'post-eco-name' + uniqueId;
const spaceNameId = 'post-eco-nameid' + uniqueId;
const challengeName = 'post-chal';
const opportunityName = 'post-opp';
let postNameID = '';
let postDisplayName = '';

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createChallengeWithUsers(challengeName);
  await createOpportunityForChallenge(opportunityName);
  postNameID = `post-name-id-${uniqueId}`;
  postDisplayName = `post-d-name-${uniqueId}`;
});
describe('Full Opportunity Deletion', () => {
  test('should delete all opportunity related data', async () => {
    // Send opportunity community update
    await sendMessageToRoom(
      entitiesId.opportunity.id,
      'test',
      TestUser.GLOBAL_ADMIN
    );

    // Create callout
    await createCalloutOnCollaboration(entitiesId.opportunity.collaborationId);

    // Create whiteboard on callout
    await createWhiteboardOnCallout(entitiesId.opportunity.whiteboardCalloutId);

    // Create post on callout and comment to it
    const resPostonSpace = await createPostOnCallout(
      entitiesId.challenge.calloutId,
      { displayName: postDisplayName },
      postNameID
    );

    const commentId =
      resPostonSpace?.data?.createContributionOnCallout.post?.comments.id ?? '';
    await sendMessageToRoom(commentId, 'test message on post');

    // Create comment on callout
    await sendMessageToRoom(
      entitiesId.challenge.discussionCalloutId,
      'comment on discussion callout'
    );

    // Assign user as member and lead
    await assignRoleToUser(
      users.notificationsAdmin.email,
      entitiesId.opportunity.communityId,
      CommunityRoleType.Member
    );
    await assignRoleToUser(
      users.notificationsAdmin.email,
      entitiesId.opportunity.communityId,
      CommunityRoleType.Lead
    );

    // Assign organization as opportunity community member and lead
    await assignRoleToOrganization(
      entitiesId.opportunity.communityId,
      entitiesId.organization.id,
      CommunityRoleType.Member
    );

    await assignRoleToOrganization(
      entitiesId.opportunity.communityId,
      entitiesId.organization.id,
      CommunityRoleType.Lead
    );

    // Act
    const resDelete = await deleteSubspace(entitiesId.opportunity.id);
    await deleteSubspace(entitiesId.challenge.id);
    await deleteSpace(entitiesId.spaceId);
    await deleteOrganization(entitiesId.organization.id);

    // Assert
    expect(resDelete?.data?.deleteOpportunity.id).toEqual(
      entitiesId.opportunity.id
    );
  });
});
