import {
  deleteSpace,
  updateSpacePlatformSettings,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { createApplication } from '@functional-api/roleset/application/application.request.params';
import { TestUser } from '@utils/test.user';
import { uniqueId } from '@utils/mutations/create-mutation';
import { createOrgAndSpace } from '@utils/data-setup/entities';
import { createPostOnCallout } from '@functional-api/callout/post/post.request.params';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { createCalloutOnCollaboration } from '@functional-api/callout/callouts.request.params';
import { createWhiteboardOnCallout } from '@functional-api/callout/call-for-whiteboards/whiteboard-collection-callout.params.request';

import { users } from '@utils/queries/users-data';
import { entitiesId } from '@test/types/entities-helper';
import {
  assignRoleToUser,
  assignRoleToOrganization,
} from '@functional-api/roleset/roles-request.params';
import { CommunityRoleType, SpaceVisibility } from '@generated/alkemio-schema';

const organizationName = 'post-org-name' + uniqueId;
const hostNameId = 'post-org-nameid' + uniqueId;
const spaceName = 'post-eco-name' + uniqueId;
const spaceNameId = 'post-eco-nameid' + uniqueId;
let postNameID = '';
let postDisplayName = '';

beforeAll(async () => {
  await createOrgAndSpace(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  postNameID = `post-name-id-${uniqueId}`;
  postDisplayName = `post-d-name-${uniqueId}`;
});
describe('Full Space Deletion', () => {
  test('should delete all space related data', async () => {
    // Change space preference
    await updateSpaceSettings(entitiesId.spaceId, {
      collaboration: { allowMembersToCreateSubspaces: true },
    });

    // Send space community update
    await sendMessageToRoom(
      entitiesId.space.updatesId,
      'test',
      TestUser.GLOBAL_ADMIN
    );

    // Create callout
    await createCalloutOnCollaboration(entitiesId.space.collaborationId);

    // Create whiteboard on callout
    await createWhiteboardOnCallout(
      entitiesId.space.whiteboardCalloutId
    );

    // Create post on callout and comment to it
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID
    );
    const commentId =
      resPostonSpace?.data?.createContributionOnCallout.post?.comments.id ?? '';
    await sendMessageToRoom(commentId, 'test message on post');

    // Create comment on callout
    await sendMessageToRoom(
      entitiesId.space.discussionCalloutId,
      'comment on discussion callout'
    );

    // User application to space community
    await createApplication(entitiesId.space.communityId);

    // Assign user as member and lead
    await assignRoleToUser(
      users.notificationsAdmin.email,
      entitiesId.space.communityId,
      CommunityRoleType.Member
    );
    await assignRoleToUser(
      users.notificationsAdmin.email,
      entitiesId.space.communityId,
      CommunityRoleType.Lead
    );

    // Assign organization as space community member and lead
    await assignRoleToOrganization(
      entitiesId.space.communityId,
      entitiesId.organization.id,
      CommunityRoleType.Member
    );

    await assignRoleToOrganization(
      entitiesId.space.communityId,
      entitiesId.organization.id,
      CommunityRoleType.Lead
    );

    // Update space visibility
    await updateSpacePlatformSettings(
      entitiesId.spaceId,
      spaceNameId,
      SpaceVisibility.Active
    );

    // Act
    const resDelete = await deleteSpace(entitiesId.spaceId);
    await deleteOrganization(entitiesId.organization.id);
    // Assert
    expect(resDelete?.data?.deleteSpace.id).toEqual(entitiesId.spaceId);
  });
});
