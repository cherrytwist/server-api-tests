import '@utils/array.matcher';
import { TestUser } from '@alkemio/tests-lib';
import { users } from '@src/scenario/TestUser';
import {
  CalloutState,
  CalloutType,
  CommunityRoleType,
  ActivityEventType,
  CalloutVisibility,
  SpacePrivacyMode,
  CommunityMembershipPolicy,
} from '@generated/alkemio-schema';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { getActivityLogOnCollaboration } from './activity-log-params';
import {
  createCalloutOnCollaboration,
  deleteCallout,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { createPostOnCallout } from '@functional-api/callout/post/post.request.params';
import { sendMessageToRoom } from '../communications/communication.params';
import { createWhiteboardOnCallout } from '../callout/call-for-whiteboards/whiteboard-collection-callout.params.request';
import { assignRoleToUser, joinRoleSet } from '../roleset/roles-request.params';
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
const uniqueId = UniqueIDGenerator.getID();

let calloutDisplayName = '';
let calloutId = '';
let postNameID = '';
let postDisplayName = '';

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'subspace-activity',
  space: {
    collaboration: {
      addCallouts: true,
    },
    subspace: {
      collaboration: {
        addCallouts: true,
      },
    }
  }
}

beforeAll(async () => {
  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);

  await updateSpaceSettings(baseScenario.space.id, {
    membership: {
      policy: CommunityMembershipPolicy.Open,
    },
  });
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

beforeEach(async () => {
  calloutDisplayName = `callout-d-name-${uniqueId}`;
  postNameID = `post-name-id-${uniqueId}`;
  postDisplayName = `post-d-name-${uniqueId}`;
});

describe('Activity logs - Subspace', () => {
  afterEach(async () => {
    await deleteCallout(calloutId);
  });
  test('should return empty arrays', async () => {
    // Act
    const res = await getActivityLogOnCollaboration(
      baseScenario.subspace.collaboration.id,
      5
    );
    const resActivityData = res?.data?.activityLogOnCollaboration;
    // Assert
    expect(resActivityData).toEqual(expect.arrayContaining([]));
  });

  test('should NOT return CALLOUT_PUBLISHED, when created', async () => {
    // Arrange
    const res = await createCalloutOnCollaboration(
      baseScenario.subspace.collaboration.id
    );
    calloutId = res?.data?.createCalloutOnCollaboration.id ?? '';

    const resActivity = await getActivityLogOnCollaboration(
      baseScenario.subspace.collaboration.id,
      5
    );
    const resActivityData = resActivity?.data?.activityLogOnCollaboration;
    // Assert
    expect(resActivityData).toEqual(expect.arrayContaining([]));
  });

  test('should return MEMBER_JOINED, when user assigned from Admin or individually joined', async () => {
    // Arrange
    await joinRoleSet(baseScenario.subspace.community.roleSetId, TestUser.SPACE_MEMBER);

    await assignRoleToUser(
      users.spaceAdmin.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Member
    );

    // Act
    const resActivity = await getActivityLogOnCollaboration(
      baseScenario.subspace.collaboration.id,
      3
    );
    const resActivityData = resActivity?.data?.activityLogOnCollaboration;

    // Assert
    expect(resActivityData).toHaveLength(3);
    expect(resActivityData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collaborationID: baseScenario.subspace.collaboration.id,
          description: `${users.spaceAdmin.id}`,
          triggeredBy: { id: users.globalAdmin.id },
          type: ActivityEventType.MemberJoined,
        }),
      ])
    );

    expect(resActivityData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collaborationID: baseScenario.subspace.collaboration.id,
          description: `${users.spaceMember.id}`,
          triggeredBy: { id: users.spaceMember.id },
          type: ActivityEventType.MemberJoined,
        }),
      ])
    );
  });

  // To be updated with the changes related to whiteboard callouts

  test.skip('should return CALLOUT_PUBLISHED, POST_CREATED, POST_COMMENT, DISCUSSION_COMMENT, WHITEBOARD_CREATED', async () => {
    // Arrange
    const res = await createCalloutOnCollaboration(
      baseScenario.subspace.collaboration.id
    );
    calloutId = res?.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(calloutId, CalloutVisibility.Published);

    const resPostonSpace = await createPostOnCallout(
      calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.GLOBAL_ADMIN
    );
    const postDataCreate =
      resPostonSpace?.data?.createContributionOnCallout.post;
    const postCommentsIdSpace = postDataCreate?.comments.id ?? '';

    const messageRes = await sendMessageToRoom(
      postCommentsIdSpace,
      'test message on space post',
      TestUser.GLOBAL_ADMIN
    );
    messageRes?.data?.sendMessageToRoom.id;

    const resDiscussion = await createCalloutOnCollaboration(
      baseScenario.subspace.collaboration.id,
      {
        framing: {
          profile: {
            displayName: calloutDisplayName + 'disc',
            description: 'discussion callout',
          },
        },
        contributionPolicy: {
          state: CalloutState.Open,
        },
        type: CalloutType.PostCollection,
      }
    );
    const calloutIdDiscussion =
      resDiscussion?.data?.createCalloutOnCollaboration.id ?? '';
    const discussionCalloutCommentsId =
      resDiscussion?.data?.createCalloutOnCollaboration?.comments?.id ?? '';

    await updateCalloutVisibility(
      calloutIdDiscussion,
      CalloutVisibility.Published
    );

    await sendMessageToRoom(
      discussionCalloutCommentsId,
      'comment on discussion callout'
    );

    const resWhiteboard = await createCalloutOnCollaboration(
      baseScenario.subspace.collaboration.id,
      {
        framing: {
          profile: {
            displayName: calloutDisplayName + 'whiteboard',
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
      baseScenario.subspace.collaboration.id,
      7
    );
    const resActivityData = resActivity?.data?.activityLogOnCollaboration;

    // Assert
    const expextedData = async (description: string, type: string) => {
      return expect.arrayContaining([
        expect.objectContaining({
          collaborationID: baseScenario.subspace.collaboration.id,
          description,
          triggeredBy: { id: users.globalAdmin.id },
          type,
        }),
      ]);
    };

    // Assert
    expect(resActivityData).toHaveLength(7);
    expect(resActivityData).toEqual(
      await expextedData(
        `[${calloutDisplayName}] - callout description`,
        ActivityEventType.CalloutPublished
      )
    );
    expect(resActivityData).toEqual(
      await expextedData(
        `[${postDisplayName}] - `,
        ActivityEventType.CalloutPostCreated
      )
    );
    expect(resActivityData).toEqual(
      await expextedData(
        'test message on space post',
        ActivityEventType.CalloutPostComment
      )
    );
    expect(resActivityData).toEqual(
      await expextedData(
        `[${calloutDisplayName + 'disc'}] - discussion callout`,
        ActivityEventType.CalloutPublished
      )
    );
    expect(resActivityData).toEqual(
      await expextedData(
        'comment on discussion callout',
        ActivityEventType.DiscussionComment
      )
    );
    expect(resActivityData).toEqual(
      await expextedData(
        `[${calloutDisplayName + 'whiteboard'}] - whiteboard callout`,
        ActivityEventType.CalloutPublished
      )
    );
    expect(resActivityData).toEqual(
      await expextedData(
        '[callout whiteboard]',
        ActivityEventType.CalloutWhiteboardCreated
      )
    );
  });
});

// Logs used in the tests below are from the previously executed tests in the file
describe('Access to Activity logs - Subspace', () => {
  beforeAll(async () => {
    await assignRoleToUser(
      users.spaceMember.id,
      baseScenario.subspace.id,
      CommunityRoleType.Admin
    );
  });

  describe('DDT user privileges to Public Subspace activity logs of Private Space', () => {
    beforeAll(async () => {
      await updateSpaceSettings(baseScenario.space.id, {
        privacy: { mode: SpacePrivacyMode.Private },
      });
      await updateSpaceSettings(baseScenario.subspace.id, {
        privacy: { mode: SpacePrivacyMode.Public },
      });
    });
    // Arrange
    test.each`
      userRole                 | message
      ${TestUser.GLOBAL_ADMIN} | ${baseScenario.subspace.collaboration.id}
      ${TestUser.SPACE_ADMIN}  | ${baseScenario.subspace.collaboration.id}
      ${TestUser.SPACE_MEMBER} | ${baseScenario.subspace.collaboration.id}
    `(
      'User: "$userRole" get message: "$message", when intend to access Public Subspace activity logs of a Private space',
      async ({ userRole, message }) => {
        // Act
        const resActivity = await getActivityLogOnCollaboration(
          baseScenario.subspace.collaboration.id,
          5,
          userRole
        );

        // Assert
        expect(
          resActivity.data?.activityLogOnCollaboration[0]?.collaborationID
        ).toContain(message);
      }
    );

    test.each`
      userRole                     | message
      ${TestUser.NON_SPACE_MEMBER} | ${'Authorization'}
    `(
      'User: "$userRole" get Error message: "$message", when intend to access Public Subspace activity logs of a Private space',
      async ({ userRole, message }) => {
        // Act
        const resActivity = await getActivityLogOnCollaboration(
          baseScenario.subspace.collaboration.id,
          5,
          userRole
        );

        // Assert
        expect(resActivity.error?.errors[0]?.message).toContain(message);
      }
    );
  });

  describe('DDT user privileges to Public Subspace activity logs of Public Space', () => {
    beforeAll(async () => {
      await updateSpaceSettings(baseScenario.space.id, {
        privacy: { mode: SpacePrivacyMode.Public },
      });
      await updateSpaceSettings(baseScenario.subspace.id, {
        privacy: { mode: SpacePrivacyMode.Public },
      });
    });
    // Arrange
    test.each`
      userRole                     | message
      ${TestUser.GLOBAL_ADMIN}     | ${baseScenario.subspace.collaboration.id}
      ${TestUser.SPACE_ADMIN}      | ${baseScenario.subspace.collaboration.id}
      ${TestUser.SPACE_MEMBER}     | ${baseScenario.subspace.collaboration.id}
      ${TestUser.NON_SPACE_MEMBER} | ${baseScenario.subspace.collaboration.id}
    `(
      'User: "$userRole" get message: "$message", when intend to access Public Subspace activity logs of a Public space',
      async ({ userRole, message }) => {
        // Act
        const resActivity = await getActivityLogOnCollaboration(
          baseScenario.subspace.collaboration.id,
          5,
          userRole
        );

        // Assert
        expect(
          resActivity.data?.activityLogOnCollaboration[0]?.collaborationID
        ).toContain(message);
      }
    );
  });
});
