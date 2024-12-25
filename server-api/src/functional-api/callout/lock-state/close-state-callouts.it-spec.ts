/* eslint-disable quotes */
import '@utils/array.matcher';
import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import {
  deleteCallout,
  createCalloutOnCollaboration,
  updateCallout,
  updateCalloutVisibility,
} from '../callouts.request.params';
import {
  createPostOnCallout,
  getDataPerSpaceCallout,
} from '../post/post.request.params';
import { TestUser } from '@alkemio/tests-lib';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
  getDefaultSubspaceCalloutByNameId,
  getDefaultSubsubspaceCalloutByNameId,
  getDefaultSpaceCalloutByNameId,
} from '@utils/data-setup/entities';
import {
  CalloutState,
  CalloutVisibility,
} from '@generated/alkemio-schema';
import { deleteSpace } from '../../journey/space/space.request.params';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { entitiesId } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';

let subsubspaceName = 'post-opp';
let subspaceName = 'post-chal';
let calloutId = '';
let postNameID = '';

const organizationName = 'callout-org-name' + uniqueId;
const hostNameId = 'callout-org-nameid' + uniqueId;
const spaceName = 'callout-eco-name' + uniqueId;
const spaceNameId = 'callout-eco-nameid' + uniqueId;

const getIdentifier = (
  entity: string,
  spaceCalloutId: string,
  subspaceCalloutId: string,
  subsubspaceCalloutId: string
) => {
  let id = '';
  if (entity === 'space') {
    id = spaceCalloutId;
    return id;
  } else if (entity === 'subspace') {
    id = subspaceCalloutId;
    return id;
  } else {
    id = subsubspaceCalloutId;
    return id;
  }
};
beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createSubspaceWithUsers(subspaceName);
  await createSubsubspaceWithUsers(subsubspaceName);
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
  postNameID = `post-name-id-${uniqueId}`;
});

describe('Callouts - Close State', () => {
  afterEach(async () => {
    await deleteCallout(calloutId);
  });
  test('Close callout that has not been published', async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      entitiesId.space.collaborationId,
      {
        framing: { profile: { displayName: 'check' } },
      }
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCallout(calloutId, TestUser.GLOBAL_ADMIN, {
      contributionPolicy: {
        state: CalloutState.Closed,
      },
    });

    const postsData = await getDataPerSpaceCallout(
      entitiesId.spaceId,
      calloutId
    );
    const data = postsData.data?.space.collaboration?.callouts?.[0];

    // Assert
    expect(data?.contributionPolicy.state).toEqual(CalloutState.Closed);
  });

  test('Close callout that has been published', async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      entitiesId.space.collaborationId
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(calloutId, CalloutVisibility.Published);

    await updateCallout(calloutId, TestUser.GLOBAL_ADMIN, {
      contributionPolicy: {
        state: CalloutState.Closed,
      },
    });
    const postsData = await getDataPerSpaceCallout(
      entitiesId.spaceId,
      calloutId
    );
    const data = postsData.data?.space.collaboration?.callouts?.[0];

    // Assert
    expect(data?.contributionPolicy.state).toEqual(CalloutState.Closed);
  });
});

// The suite contains scenarios for 'post create' and 'post comment'. Post Update / Delete to be added on later stage (low priority)
describe('Callout - Close State - User Privileges Posts', () => {
  let spaceCalloutId = '';
  let subspaceCalloutId = '';
  let subsubspaceCalloutId = '';
  let postCommentsIdSpace = '';
  let postCommentsIdSubspace = '';
  let postCommentsIdSubsubspace = '';

  beforeAll(async () => {
    const preconditions = async (calloutId: string) => {
      const resPostonSpace = await createPostOnCallout(calloutId, {
        displayName: 'postDisplayName',
      });
      const postDataCreate =
        resPostonSpace.data?.createContributionOnCallout.post;
      const postCommentsId = postDataCreate?.comments.id ?? '';

      await updateCallout(calloutId, TestUser.GLOBAL_ADMIN, {
        contributionPolicy: {
          state: CalloutState.Closed,
        },
      });
      return postCommentsId;
    };

    const spaceCallout = await getDefaultSpaceCalloutByNameId(
      entitiesId.spaceId,
      entitiesId.space.calloutId
    );
    spaceCalloutId = spaceCallout?.data?.lookup?.callout?.id ?? '';
    postCommentsIdSpace = await preconditions(spaceCalloutId);

    const subspaceCallout = await getDefaultSubspaceCalloutByNameId(
      entitiesId.spaceId,
      entitiesId.subspace.id,
      entitiesId.subspace.calloutId
    );
    subspaceCalloutId = subspaceCallout?.data?.lookup?.callout?.id ?? '';
    postCommentsIdSubspace = await preconditions(subspaceCalloutId);

    const subsubspaceCallout = await getDefaultSubsubspaceCalloutByNameId(
      entitiesId.spaceId,
      entitiesId.subsubspace.id,
      entitiesId.subsubspace.calloutId
    );
    subsubspaceCalloutId = subsubspaceCallout?.id ?? '';
    postCommentsIdSubsubspace = await preconditions(subsubspaceCalloutId);
  });

  afterAll(async () => {
    await deleteCallout(subsubspaceCalloutId);
    await deleteCallout(subspaceCalloutId);
    await deleteCallout(spaceCalloutId);
  });

  describe('Send Comment to Post - Callout Close State ', () => {
    describe('DDT Users sending messages to closed callout post', () => {
      // Arrange
      test.each`
        userRole                       | message          | entity
        ${TestUser.SPACE_ADMIN}          | ${'sendComment'} | ${'space'}
        ${TestUser.SPACE_MEMBER}         | ${'sendComment'} | ${'space'}
        ${TestUser.SUBSPACE_ADMIN}    | ${'sendComment'} | ${'subspace'}
        ${TestUser.SUBSPACE_MEMBER}   | ${'sendComment'} | ${'subspace'}
        ${TestUser.SUBSUBSPACE_ADMIN}  | ${'sendComment'} | ${'subsubspace'}
        ${TestUser.SUBSUBSPACE_MEMBER} | ${'sendComment'} | ${'subsubspace'}
      `(
        'User: "$userRole" can send message to closed "$entity" callout post',
        async ({ userRole, message, entity }) => {
          const id = getIdentifier(
            entity,
            postCommentsIdSpace,
            postCommentsIdSubspace,
            postCommentsIdSubsubspace
          );

          const messageRes = await sendMessageToRoom(
            id,
            'sendComment',
            userRole
          );

          // Assert
          expect(
            JSON.stringify(messageRes.data?.sendMessageToRoom.message)
          ).toContain(message);
        }
      );

      test.each`
        userRole                   | message                                                                            | entity
        ${TestUser.NON_SPACE_MEMBER} | ${"Authorization: unable to grant 'create-message' privilege: room send message:"} | ${'space'}
        ${TestUser.NON_SPACE_MEMBER} | ${"Authorization: unable to grant 'create-message' privilege: room send message:"} | ${'subspace'}
        ${TestUser.NON_SPACE_MEMBER} | ${"Authorization: unable to grant 'create-message' privilege: room send message:"} | ${'subsubspace'}
      `(
        'User: "$userRole" cannot send message to closed "$entity" callout post',
        async ({ userRole, message, entity }) => {
          const id = getIdentifier(
            entity,
            postCommentsIdSpace,
            postCommentsIdSubspace,
            postCommentsIdSubsubspace
          );

          const messageRes = await sendMessageToRoom(
            id,
            'sendComment',
            userRole
          );

          // Assert
          expect(JSON.stringify(messageRes.error?.errors[0].message)).toContain(
            message
          );
        }
      );
    });
  });

  describe('Create Post - Callout Close State ', () => {
    describe('DDT Users create post to closed callout', () => {
      // Arrange
      test.each`
        userRole                       | message                                                                                    | entity
        ${TestUser.SPACE_ADMIN}          | ${'"data":{"createContributionOnCallout"'}                                                 | ${'space'}
        ${TestUser.SPACE_MEMBER}         | ${'"New contributions to a closed Callout with id'}                                        | ${'space'}
        ${TestUser.NON_SPACE_MEMBER}     | ${"Authorization: unable to grant 'contribute' privilege: create contribution on callout"} | ${'space'}
        ${TestUser.SUBSPACE_ADMIN}    | ${'"data":{"createContributionOnCallout"'}                                                 | ${'subspace'}
        ${TestUser.SUBSPACE_MEMBER}   | ${'"New contributions to a closed Callout with id'}                                        | ${'subspace'}
        ${TestUser.NON_SPACE_MEMBER}     | ${"Authorization: unable to grant 'contribute' privilege: create contribution on callout"} | ${'subspace'}
        ${TestUser.SUBSUBSPACE_ADMIN}  | ${'"data":{"createContributionOnCallout"'}                                                 | ${'subsubspace'}
        ${TestUser.SUBSUBSPACE_MEMBER} | ${'"New contributions to a closed Callout with id'}                                        | ${'subsubspace'}
        ${TestUser.NON_SPACE_MEMBER}     | ${"Authorization: unable to grant 'contribute' privilege: create contribution on callout"} | ${'subsubspace'}
      `(
        'User: "$userRole" get error when create post to closed "$entity" callout',
        async ({ userRole, message, entity }) => {
          const id = getIdentifier(
            entity,
            spaceCalloutId,
            subspaceCalloutId,
            subsubspaceCalloutId
          );

          const res = await createPostOnCallout(
            id,
            {
              displayName: 'postDisplayName',
            },
            postNameID,
            userRole
          );

          // Assert
          expect(JSON.stringify(res)).toContain(message);
        }
      );
    });
  });
});

describe('Callout - Close State - User Privileges Discussions', () => {
  let spaceCalloutId = '';
  let subspaceCalloutId = '';
  let subsubspaceCalloutId = '';
  let spaceCalloutCommentsId = '';
  let subspaceCalloutCommentsId = '';
  let subsubspaceCalloutCommentsId = '';

  beforeAll(async () => {
    const preconditions = async (calloutId: string) => {
      await updateCallout(calloutId, TestUser.GLOBAL_ADMIN, {
        contributionPolicy: {
          state: CalloutState.Closed,
        },
      });
    };

    const spaceCallout = await getDefaultSpaceCalloutByNameId(
      entitiesId.spaceId,
      entitiesId.space.discussionCalloutId
    );

    spaceCalloutId = spaceCallout?.data?.lookup?.callout?.id ?? '';
    spaceCalloutCommentsId =
      spaceCallout?.data?.lookup?.callout?.comments?.id ?? '';
    await preconditions(spaceCalloutId);

    const subspaceCallout = await getDefaultSubspaceCalloutByNameId(
      entitiesId.spaceId,
      entitiesId.subspace.id,
      entitiesId.subspace.discussionCalloutId
    );
    subspaceCalloutId = subspaceCallout?.data?.lookup?.callout?.id ?? '';
    subspaceCalloutCommentsId =
      subspaceCallout?.data?.lookup?.callout?.comments?.id ?? '';
    await preconditions(subspaceCalloutId);

    const subsubspaceCallout = await getDefaultSubsubspaceCalloutByNameId(
      entitiesId.spaceId,
      entitiesId.subsubspace.id,
      entitiesId.subsubspace.discussionCalloutId
    );
    subsubspaceCalloutId = subsubspaceCallout?.id ?? '';
    subsubspaceCalloutCommentsId = subsubspaceCallout?.comments?.id ?? '';
    await preconditions(subsubspaceCalloutId);
  });

  afterAll(async () => {
    await deleteCallout(subsubspaceCalloutId);
    await deleteCallout(subspaceCalloutId);
    await deleteCallout(spaceCalloutId);
  });

  describe('Discussion Callout - Close State ', () => {
    describe('DDT Users sending messages to closed discussion callout', () => {
      // Arrange
      test.each`
        userRole                       | code                  | entity
        ${TestUser.SPACE_ADMIN}          | ${'CALLOUT_CLOSED'}   | ${'space'}
        ${TestUser.SPACE_MEMBER}         | ${'CALLOUT_CLOSED'}   | ${'space'}
        ${TestUser.NON_SPACE_MEMBER}     | ${'FORBIDDEN_POLICY'} | ${'space'}
        ${TestUser.SUBSPACE_ADMIN}    | ${'CALLOUT_CLOSED'}   | ${'subspace'}
        ${TestUser.SUBSPACE_MEMBER}   | ${'CALLOUT_CLOSED'}   | ${'subspace'}
        ${TestUser.NON_SPACE_MEMBER}     | ${'FORBIDDEN_POLICY'} | ${'subspace'}
        ${TestUser.SUBSUBSPACE_ADMIN}  | ${'CALLOUT_CLOSED'}   | ${'subsubspace'}
        ${TestUser.SUBSUBSPACE_MEMBER} | ${'CALLOUT_CLOSED'}   | ${'subsubspace'}
        ${TestUser.NON_SPACE_MEMBER}     | ${'FORBIDDEN_POLICY'} | ${'subsubspace'}
      `(
        'User: "$userRole" get error when send code to closed "$entity" callout',
        async ({ userRole, code, entity }) => {
          const commentsId = getIdentifier(
            entity,
            spaceCalloutCommentsId,
            subspaceCalloutCommentsId,
            subsubspaceCalloutCommentsId
          );
          // Act
          const res = await sendMessageToRoom(
            commentsId,
            'comment on discussion callout',
            userRole
          );

          // Assert
          expect(res.error?.errors[0].code).toContain(code);
        }
      );
    });
  });
});
