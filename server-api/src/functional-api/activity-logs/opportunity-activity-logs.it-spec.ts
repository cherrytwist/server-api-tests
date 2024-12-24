import '@utils/array.matcher';
import { TestUser } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import {
  createSubspaceWithUsers,
  createSubsubspaceForSubspace,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import {
  CalloutState,
  CalloutType,
  CommunityRoleType,
  ActivityEventType,
  CalloutVisibility,
  CommunityMembershipPolicy,
  SpacePrivacyMode,
} from '@generated/alkemio-schema';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import {
  createCalloutOnCollaboration,
  deleteCallout,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { getActivityLogOnCollaboration } from './activity-log-params';
import { createPostOnCallout } from '@functional-api/callout/post/post.request.params';
import { sendMessageToRoom } from '../communications/communication.params';
import { createWhiteboardOnCallout } from '../callout/call-for-whiteboards/whiteboard-collection-callout.params.request';
import { assignRoleToUser } from '../roleset/roles-request.params';
import { entitiesId } from '../../types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();

let subsubspaceName = 'post-opp';
let subspaceName = 'post-chal';
let callDN = '';
let calloutId = '';
let postNameID = '';
let postDisplayName = '';
const organizationName = 'callout-org-name' + uniqueId;
const hostNameId = 'callout-org-nameid' + uniqueId;
const spaceName = 'callout-eco-name' + uniqueId;
const spaceNameId = 'callout-eco-nameid' + uniqueId;

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await updateSpaceSettings(entitiesId.spaceId, {
    membership: {
      policy: CommunityMembershipPolicy.Open,
    },
  });

  await createSubspaceWithUsers(subspaceName);
  await createSubsubspaceForSubspace(subsubspaceName);
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

beforeEach(async () => {
  subspaceName = `testSubspace ${uniqueId}`;
  subsubspaceName = `subsubspaceName ${uniqueId}`;
  callDN = `callout-d-name-${uniqueId}`;
  postNameID = `post-name-id-${uniqueId}`;
  postDisplayName = `post-d-name-${uniqueId}`;
});

describe('Activity logs - Subsubspace', () => {
  afterEach(async () => {
    await deleteCallout(calloutId);
  });
  test('should return empty arrays', async () => {
    // Act
    const resActivity = await getActivityLogOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      5
    );
    const resActivityData = resActivity?.data?.activityLogOnCollaboration;

    // Assert
    expect(resActivityData).toHaveLength(4);
  });

  test('should NOT return CALLOUT_PUBLISHED, when created', async () => {
    // Arrange
    const res = await createCalloutOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      { framing: { profile: { displayName: callDN } } }
    );
    calloutId = res?.data?.createCalloutOnCollaboration.id ?? '';

    const resActivity = await getActivityLogOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      5
    );
    const resActivityData = resActivity?.data?.activityLogOnCollaboration;

    expect(resActivityData).toHaveLength(4);
  });

  test('should return MEMBER_JOINED, when user assigned from Admin', async () => {
    // Arrange
    await assignRoleToUser(
      users.subspaceMember.id,
      entitiesId.subsubspace.roleSetId,
      CommunityRoleType.Member
    );

    // Act
    const resActivity = await getActivityLogOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      5
    );
    const resActivityData = resActivity?.data?.activityLogOnCollaboration;

    // Assert
    expect(resActivityData).toHaveLength(5);
    expect(resActivityData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collaborationID: entitiesId.subsubspace.collaborationId,
          description: `${users.subspaceMember.id}`,
          triggeredBy: { id: users.globalAdmin.id },
          type: ActivityEventType.MemberJoined,
        }),
      ])
    );

    expect(resActivityData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collaborationID: entitiesId.subsubspace.collaborationId,
          description: `${users.globalAdmin.id}`,
          triggeredBy: { id: users.globalAdmin.id },
          type: ActivityEventType.MemberJoined,
        }),
      ])
    );
  });

  // To be updated with the changes related to whiteboard callouts
  test.skip('should return CALLOUT_PUBLISHED, POST_CREATED, POST_COMMENT, DISCUSSION_COMMENT, WHITEBOARD_CREATED', async () => {
    // Arrange
    const res = await createCalloutOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      { framing: { profile: { displayName: callDN } } }
    );
    calloutId = res?.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(calloutId, CalloutVisibility.Published);

    const resPostonSpace = await createPostOnCallout(
      calloutId,
      { displayName: postDisplayName },
      postNameID,

      TestUser.GLOBAL_ADMIN
    );
    const postDataCreate = resPostonSpace?.data?.createContributionOnCallout;
    const postCommentsIdSpace = postDataCreate?.post?.comments.id ?? '';

    const messageRes = await sendMessageToRoom(
      postCommentsIdSpace,
      'test message on space post',
      TestUser.GLOBAL_ADMIN
    );
    messageRes?.data?.sendMessageToRoom.id;

    const resDiscussion = await createCalloutOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      {
        framing: {
          profile: {
            displayName: callDN + 'disc',
            description: 'discussion callout',
          },
        },
        contributionPolicy: {
          state: CalloutState.Open,
        },
        type: CalloutType.Whiteboard,
      }
    );
    const calloutIdDiscussion =
      resDiscussion?.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutIdDiscussion,
      CalloutVisibility.Published
    );

    await sendMessageToRoom(
      calloutIdDiscussion,
      'comment on discussion callout'
    );

    const resWhiteboard = await createCalloutOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      {
        framing: {
          profile: {
            displayName: callDN + 'whiteboard',
            description: 'whiteboard callout',
          },
        },
        contributionPolicy: {
          state: CalloutState.Open,
        },
        type: CalloutType.Whiteboard,
      }
    );
    const calloutIdWhiteboard =
      resWhiteboard?.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutIdWhiteboard,
      CalloutVisibility.Published
    );
    await createWhiteboardOnCallout(calloutIdWhiteboard);

    // Act
    const resActivity = await getActivityLogOnCollaboration(
      entitiesId.subsubspace.collaborationId,
      7
    );
    const resAD = resActivity?.data?.activityLogOnCollaboration;

    // Assert

    const expextedData = async (description: string, type: string) => {
      return expect.arrayContaining([
        expect.objectContaining({
          collaborationID: entitiesId.subsubspace.collaborationId,
          description,
          triggeredBy: { id: users.globalAdmin.id },
          type,
        }),
      ]);
    };

    // Assert
    expect(resAD).toHaveLength(7);
    expect(resAD).toEqual(
      await expextedData(
        `[${callDN}] - callout description`,
        ActivityEventType.CalloutPublished
      )
    );
    expect(resAD).toEqual(
      await expextedData(
        `[${postDisplayName}] - `,
        ActivityEventType.CalloutPostCreated
      )
    );
    expect(resAD).toEqual(
      await expextedData(
        'test message on space post',
        ActivityEventType.CalloutPostComment
      )
    );
    expect(resAD).toEqual(
      await expextedData(
        `[${callDN + 'disc'}] - discussion callout`,
        ActivityEventType.CalloutPublished
      )
    );
    expect(resAD).toEqual(
      await expextedData(
        'comment on discussion callout',
        ActivityEventType.DiscussionComment
      )
    );
    expect(resAD).toEqual(
      await expextedData(
        `[${callDN + 'whiteboard'}] - whiteboard callout`,
        ActivityEventType.CalloutPublished
      )
    );
    expect(resAD).toEqual(
      await expextedData(
        '[callout whiteboard]',
        ActivityEventType.CalloutWhiteboardCreated
      )
    );
  });
});

// Logs used in the tests below are from the previously executed tests in the file
describe('Access to Activity logs - Subsubspace', () => {
  beforeAll(async () => {
    await assignRoleToUser(
      users.spaceMember.id,
      entitiesId.subsubspace.id,
      CommunityRoleType.Admin
    );
  });

  describe('DDT user privileges to Public Subsubspace activity logs of Private Space', () => {
    beforeAll(async () => {
      await updateSpaceSettings(entitiesId.spaceId, {
        privacy: { mode: SpacePrivacyMode.Private },
      });

      // The privilege of the subspace should cascade to subspace level2
      await updateSpaceSettings(entitiesId.subsubspace.id, {
        privacy: { mode: SpacePrivacyMode.Public },
      });
    });
    // Arrange
    test.each`
      userRole                 | message
      ${TestUser.GLOBAL_ADMIN} | ${entitiesId.subsubspace.collaborationId}
      ${TestUser.SPACE_ADMIN}    | ${entitiesId.subsubspace.collaborationId}
      ${TestUser.SPACE_MEMBER}   | ${entitiesId.subsubspace.collaborationId}
    `(
      'User: "$userRole" get message: "$message", when intend to access Public Subsubspace activity logs of a Private space',
      async ({ userRole, message }) => {
        // Act
        const resActivity = await getActivityLogOnCollaboration(
          entitiesId.subsubspace.collaborationId,
          5,
          userRole
        );

        // Assert
        expect(
          resActivity.data?.activityLogOnCollaboration[0].collaborationID
        ).toContain(message);
      }
    );

    test.each`
      userRole                   | message
      ${TestUser.NON_SPACE_MEMBER} | ${'Authorization'}
    `(
      'User: "$userRole" get Error message: "$message", when intend to access Public Subsubspace activity logs of a Private space',
      async ({ userRole, message }) => {
        // Act
        const resActivity = await getActivityLogOnCollaboration(
          entitiesId.subsubspace.collaborationId,
          5,
          userRole
        );

        // Assert
        expect(resActivity.error?.errors[0]?.message).toContain(message);
      }
    );
  });

  describe('DDT user privileges to Public Subsubspace activity logs of Public Space', () => {
    beforeAll(async () => {
      await updateSpaceSettings(entitiesId.spaceId, {
        privacy: { mode: SpacePrivacyMode.Public },
      });
      await updateSpaceSettings(entitiesId.subspace.id, {
        privacy: { mode: SpacePrivacyMode.Public },
      });
      await updateSpaceSettings(entitiesId.subsubspace.id, {
        privacy: { mode: SpacePrivacyMode.Public },
      });
    });

    // Arrange
    test.each`
      userRole                   | message
      ${TestUser.GLOBAL_ADMIN}   | ${entitiesId.subsubspace.collaborationId}
      ${TestUser.SPACE_ADMIN}      | ${entitiesId.subsubspace.collaborationId}
      ${TestUser.SPACE_MEMBER}     | ${entitiesId.subsubspace.collaborationId}
      ${TestUser.NON_SPACE_MEMBER} | ${entitiesId.subsubspace.collaborationId}
    `(
      'User: "$userRole" get message: "$message", when intend to access Public Subsubspace activity logs of a Public space',
      async ({ userRole, message }) => {
        // Act
        const resActivity = await getActivityLogOnCollaboration(
          entitiesId.subsubspace.collaborationId,
          5,
          userRole
        );

        // Assert
        expect(
          resActivity.data?.activityLogOnCollaboration[0].collaborationID
        ).toContain(message);
      }
    );
  });
});
