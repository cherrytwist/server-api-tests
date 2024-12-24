import '@utils/array.matcher';
import {
  deletePost,
  postDataPerSpaceCallout,
  getDataPerSpaceCallout,
  createPostOnCallout,
  updatePost,
  getPostData,
} from './post.request.params';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { TestUser } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import {
  createSubspaceWithUsers,
  createOpportunityWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import {
  removeMessageOnRoom,
  sendMessageToRoom,
} from '@functional-api/communications/communication.params';
import { errorAuthUpdatePost } from '../../templates/post/post-template-testdata';
import {
  createReferenceOnProfile,
  deleteReferenceOnProfile,
} from '@functional-api/references/references.request.params';
import { entitiesId } from '@src/types/entities-helper';
import { uniqueId } from '@utils/uniqueId';
import { delay } from '@alkemio/tests-lib';

let opportunityName = 'post-opp';
let subspaceName = 'post-chal';
let spacePostId = '';
let subspacePostId = '';
let opportunityPostId = '';
let postNameID = '';
let postDisplayName = '';
let postCommentsIdSpace = '';
let postCommentsIdSubspace = '';
let msessageId = '';
const spaceCalloutId = '';

const organizationName = 'post-org-name' + uniqueId;
const hostNameId = 'post-org-nameid' + uniqueId;
const spaceName = 'post-eco-name' + uniqueId;
const spaceNameId = 'post-eco-nameid' + uniqueId;

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createSubspaceWithUsers(subspaceName);
  await createOpportunityWithUsers(opportunityName);
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

beforeEach(async () => {
  subspaceName = `testSubspace ${uniqueId}`;
  opportunityName = `opportunityName ${uniqueId}`;
  postNameID = `post-name-id-${uniqueId}`;
  postDisplayName = `post-d-name-${uniqueId}`;
});

describe('Posts - Create', () => {
  afterEach(async () => {
    await deletePost(spacePostId);
    await deletePost(subspacePostId);
    await deletePost(opportunityPostId);
  });
  test('HM should create post on space callout', async () => {
    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SPACE_MEMBER
    );
    const postDataCreate =
      resPostonSpace.data?.createContributionOnCallout.post;
    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    const postsData = await getDataPerSpaceCallout(
      entitiesId.spaceId,
      entitiesId.space.calloutId,
      TestUser.SPACE_MEMBER
    );
    const data = postsData.data?.space.collaboration?.callouts?.[0].contributions?.find(
      c => c.post && c.post.id === spacePostId
    )?.post;

    // Assert
    expect(data).toEqual(postDataCreate);
  });

  test('GA should create post on space callout without setting nameId', async () => {
    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID
    );

    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
    const spacePostNameId =
      resPostonSpace.data?.createContributionOnCallout.post?.nameID;

    // Assert
    expect(spacePostNameId).toContain(postNameID);
  });

  test('NON-SM should NOT create post on space callout', async () => {
    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.NON_SPACE_MEMBER
    );

    // Assert
    expect(JSON.stringify(resPostonSpace)).toContain(
      `Authorization: unable to grant 'contribute' privilege: create contribution on callout: ${spaceCalloutId}`
    );
  });

  test('ChA should create post on subspace callout', async () => {
    // Act
    const resPostonSubspace = await createPostOnCallout(
      entitiesId.subspace.calloutId,
      { displayName: postDisplayName },
      postNameID + 'ch',
      TestUser.SUBSPACE_ADMIN
    );

    const postDataCreate =
      resPostonSubspace.data?.createContributionOnCallout.post;
    subspacePostId =
      resPostonSubspace.data?.createContributionOnCallout.post?.id ?? '';

    const post = await getPostData(subspacePostId, TestUser.SUBSPACE_ADMIN);

    // Assert
    expect(post.data?.lookup.post).toEqual(postDataCreate);
  });

  test('GA should create post on opportunity callout', async () => {
    // Act
    const resPostonOpportunity = await createPostOnCallout(
      entitiesId.subsubspace.calloutId,
      { displayName: postDisplayName },
      postNameID + 'op'
    );

    const postDataCreate =
      resPostonOpportunity.data?.createContributionOnCallout.post;
    opportunityPostId =
      resPostonOpportunity.data?.createContributionOnCallout.post?.id ?? '';

    const post = await getPostData(opportunityPostId, TestUser.GLOBAL_ADMIN);

    // Assert
    expect(post.data?.lookup.post).toEqual(postDataCreate);
  });
});

describe('Posts - Update', () => {
  beforeAll(async () => {
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName + 'forUpdates' },
      `post-name-id-up-${uniqueId}`
    );
    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
  });

  afterAll(async () => {
    await deletePost(spacePostId);
  });

  test('HM should NOT update post created on space callout from GA', async () => {
    // Act
    const resPostonSpace = await updatePost(
      spacePostId,
      postNameID,
      { profileData: { displayName: postDisplayName + 'HM update' } },
      TestUser.SPACE_MEMBER
    );

    // Assert
    expect(JSON.stringify(resPostonSpace)).toContain(errorAuthUpdatePost);
  });

  test('NON-HM should NOT update post created on space callout from GA', async () => {
    // Arrange
    const resPostonSpace = await updatePost(
      spacePostId,
      postNameID,
      { profileData: { displayName: postDisplayName + 'Non-HM update' } },
      TestUser.NON_SPACE_MEMBER
    );

    // Act
    expect(JSON.stringify(resPostonSpace)).toContain(errorAuthUpdatePost);
  });

  test('HA should update post created on space callout from GA', async () => {
    // Arrange
    const resPostonSpace = await updatePost(
      spacePostId,
      postNameID,
      { profileData: { displayName: postDisplayName + 'HA update' } },
      TestUser.SPACE_ADMIN
    );
    const postDataUpdate = resPostonSpace.data?.updatePost;

    // Act
    const postsData = await getDataPerSpaceCallout(
      entitiesId.spaceId,
      entitiesId.space.calloutId,
      TestUser.SPACE_ADMIN
    );
    const data = postsData.data?.space.collaboration?.callouts?.[0].contributions?.find(
      c => c.post && c.post.id === postDataUpdate?.id
    )?.post;

    // Assert
    expect(data).toEqual(postDataUpdate);
  });
  test('GA should update post created on space callout from GA', async () => {
    // Arrange
    const resPostonSpace = await updatePost(
      spacePostId,
      postNameID,
      { profileData: { displayName: postDisplayName + 'GA update' } },
      TestUser.GLOBAL_ADMIN
    );
    const postDataUpdate = resPostonSpace.data?.updatePost;

    // Act
    const postsData = await getDataPerSpaceCallout(
      entitiesId.spaceId,
      entitiesId.space.calloutId
    );
    const data = postsData.data?.space.collaboration?.callouts?.[0].contributions?.find(
      c => c.post && c.post.id === postDataUpdate?.id
    )?.post;

    // Assert
    expect(data).toEqual(postDataUpdate);
  });
});

test('HM should update post created on space callout from HM', async () => {
  // Arrange
  const resPostonSpaceEM = await createPostOnCallout(
    entitiesId.space.calloutId,
    { displayName: postDisplayName + 'HM' },
    postNameID,
    TestUser.SPACE_MEMBER
  );
  const spacePostIdEM =
    resPostonSpaceEM.data?.createContributionOnCallout.post?.id ?? 'ß';

  // Act
  const resPostonSpace = await updatePost(
    spacePostIdEM,
    postNameID,
    { profileData: { displayName: postDisplayName + 'HM update' } },

    TestUser.SPACE_MEMBER
  );

  const postDataUpdate = resPostonSpace.data?.updatePost;

  // Act
  const postsData = await getDataPerSpaceCallout(
    entitiesId.spaceId,
    entitiesId.space.calloutId,
    TestUser.SPACE_MEMBER
  );
  const data = postsData.data?.space.collaboration?.callouts?.[0].contributions?.find(
    c => c.post && c.post.id === spacePostIdEM
  )?.post;

  // Assert
  expect(data).toEqual(postDataUpdate);

  await deletePost(spacePostIdEM);
});

describe('Posts - Delete', () => {
  test('HM should NOT delete post created on space callout from GA', async () => {
    // Arrange
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID
    );

    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    const responseRemove = await deletePost(spacePostId, TestUser.SPACE_MEMBER);

    const postsData = await postDataPerSpaceCallout(
      entitiesId.spaceId,
      entitiesId.space.calloutId
    );

    // Assert
    expect(responseRemove.error?.errors[0].message).toContain(
      `Authorization: unable to grant 'delete' privilege: delete post: ${spacePostId}`
    );
    expect(postsData).toHaveLength(1);
    await deletePost(spacePostId);
  });

  test('HM should delete post created on space callout from Himself', async () => {
    // Arrange
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SPACE_MEMBER
    );

    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    await deletePost(spacePostId, TestUser.SPACE_MEMBER);
    const postsData = await postDataPerSpaceCallout(
      entitiesId.spaceId,
      entitiesId.space.calloutId
    );

    // Assert
    expect(postsData).toHaveLength(0);
  });

  test('HM should delete post created on space callout from EM', async () => {
    // Arrange
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SPACE_MEMBER
    );
    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    await deletePost(spacePostId, TestUser.GLOBAL_ADMIN);
    const postsData = await postDataPerSpaceCallout(
      entitiesId.spaceId,
      entitiesId.space.calloutId
    );
    // Assert
    expect(postsData).toHaveLength(0);
  });

  test('NON-EM should NOT delete post created on space callout created from HM', async () => {
    // Arrange
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SPACE_MEMBER
    );

    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    const responseRemove = await deletePost(
      spacePostId,
      TestUser.NON_SPACE_MEMBER
    );

    const postsData = await postDataPerSpaceCallout(
      entitiesId.spaceId,
      entitiesId.space.calloutId
    );
    // Assert
    expect(responseRemove.error?.errors[0].code).toContain('FORBIDDEN_POLICY');
    expect(postsData).toHaveLength(1);
    await deletePost(spacePostId);
  });

  test('ChA should delete post created on subspace callout from GA', async () => {
    // Arrange
    const resPostonSubspace = await createPostOnCallout(
      entitiesId.subspace.calloutId,
      { displayName: postDisplayName + 'ch' },
      postNameID + 'ch'
    );
    subspacePostId =
      resPostonSubspace.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    await deletePost(subspacePostId, TestUser.SUBSPACE_ADMIN);
    const data = await getPostData(subspacePostId);

    // Assert
    expect(data.error?.errors[0].message).toEqual(
      `Not able to locate post with the specified ID: ${subspacePostId}`
    );
  });

  test('HA should delete post created on subspace callout from ChA', async () => {
    // Arrange
    const resPostonSubspace = await createPostOnCallout(
      entitiesId.subspace.calloutId,
      { displayName: postDisplayName + 'ch' },
      postNameID + 'ch',
      TestUser.SUBSPACE_ADMIN
    );

    subspacePostId =
      resPostonSubspace.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    await deletePost(subspacePostId, TestUser.SPACE_ADMIN);
    const data = await getPostData(subspacePostId);

    // Assert
    expect(data.error?.errors[0].message).toEqual(
      `Not able to locate post with the specified ID: ${subspacePostId}`
    );
  });

  test('ChA should delete post created on opportunity callout from OM', async () => {
    // Act
    const resPostonOpportunity = await createPostOnCallout(
      entitiesId.subsubspace.calloutId,
      { displayName: postDisplayName + 'opm' },
      postNameID + 'opm',
      TestUser.SUBSUBSPACE_MEMBER
    );
    opportunityPostId =
      resPostonOpportunity.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    await deletePost(opportunityPostId, TestUser.SUBSPACE_ADMIN);
    const data = await getPostData(opportunityPostId);

    // Assert
    expect(data.error?.errors[0].message).toEqual(
      `Not able to locate post with the specified ID: ${opportunityPostId}`
    );
  });

  test('ChM should not delete post created on subspace callout from ChA', async () => {
    // Arrange
    const resPostonSubspace = await createPostOnCallout(
      entitiesId.subspace.calloutId,
      { displayName: postDisplayName + 'ch' },
      postNameID + 'ch',
      TestUser.SUBSPACE_ADMIN
    );

    subspacePostId =
      resPostonSubspace.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    const responseRemove = await deletePost(
      subspacePostId,
      TestUser.SUBSPACE_MEMBER
    );

    const dataPost = await getPostData(subspacePostId);

    // // Assert
    expect(responseRemove?.error?.errors[0].message).toContain(
      `Authorization: unable to grant 'delete' privilege: delete post: ${dataPost?.data?.lookup?.post?.id}`
    );
    expect(dataPost?.data?.lookup?.post?.id).toEqual(subspacePostId);
    await deletePost(subspacePostId);
  });

  test('OM should delete own post on opportunity callout', async () => {
    // Act
    const resPostonOpportunity = await createPostOnCallout(
      entitiesId.subsubspace.calloutId,
      { displayName: postDisplayName + 'ch' },
      postNameID + 'op',
      TestUser.SUBSUBSPACE_MEMBER
    );
    opportunityPostId =
      resPostonOpportunity.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    await deletePost(opportunityPostId, TestUser.SUBSUBSPACE_MEMBER);
    const data = await getPostData(opportunityPostId);

    // Assert
    expect(data.error?.errors[0].message).toEqual(
      `Not able to locate post with the specified ID: ${opportunityPostId}`
    );
  });

  test('GA should delete own post on opportunity callout', async () => {
    // Act
    const resPostonOpportunity = await createPostOnCallout(
      entitiesId.subsubspace.calloutId,
      { displayName: postDisplayName + 'ch' },
      postNameID + 'op',
      TestUser.GLOBAL_ADMIN
    );
    opportunityPostId =
      resPostonOpportunity.data?.createContributionOnCallout.post?.id ?? '';

    // Act
    await deletePost(opportunityPostId, TestUser.GLOBAL_ADMIN);
    const data = await getPostData(opportunityPostId);

    // Assert
    expect(data.error?.errors[0].message).toEqual(
      `Not able to locate post with the specified ID: ${opportunityPostId}`
    );
  });
});

describe('Posts - Messages', () => {
  describe('Send Message - Post created by GA on Space callout', () => {
    beforeAll(async () => {
      const resPostonSpace = await createPostOnCallout(
        entitiesId.space.calloutId,
        { displayName: `asp-nspace-mess-${uniqueId}` },
        `asp-dspace-mess-${uniqueId}`
      );

      spacePostId =
        resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
      postCommentsIdSpace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';

      const resPostonSubspace = await createPostOnCallout(
        entitiesId.subspace.calloutId,
        { displayName: `asp-nchal-mess-${uniqueId}` },
        `asp-dchal-mess-${uniqueId}`
      );

      subspacePostId =
        resPostonSubspace.data?.createContributionOnCallout.post?.id ?? '';
      postCommentsIdSubspace =
        resPostonSubspace.data?.createContributionOnCallout.post?.comments
          .id ?? '';
    });

    afterAll(async () => {
      await deletePost(spacePostId);
      await deletePost(subspacePostId);
    });

    afterEach(async () => {
      await delay(3000);
      await removeMessageOnRoom(
        postCommentsIdSpace,
        msessageId,
        TestUser.GLOBAL_ADMIN
      );
    });

    test('ChA should send comment on post created on subspace callout from GA', async () => {
      // Arrange
      const messageRes = await sendMessageToRoom(
        postCommentsIdSubspace,
        'test message on subspace post',
        TestUser.SUBSPACE_ADMIN
      );
      msessageId = messageRes?.data?.sendMessageToRoom.id;
      const postsData = await getPostData(subspacePostId);

      // Assert
      expect(postsData.data?.lookup.post?.comments).toEqual({
        id: postCommentsIdSubspace,
        messagesCount: 1,
        messages: [
          {
            id: msessageId,
            message: 'test message on subspace post',
            sender: { id: users.subspaceAdmin.id },
          },
        ],
      });
    });

    test('HM should send comment on post created on space callout from GA', async () => {
      // Arrange
      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message',
        TestUser.SPACE_MEMBER
      );
      msessageId = messageRes?.data?.sendMessageToRoom.id;
      const postsData = await getPostData(spacePostId);

      // Assert
      expect(postsData.data?.lookup.post?.comments).toEqual({
        id: postCommentsIdSpace,
        messagesCount: 1,
        messages: [
          {
            id: msessageId,
            message: 'test message',
            sender: { id: users.spaceMember.id },
          },
        ],
      });
    });

    test('NON-HM should NOT send comment on post created on space callout from GA', async () => {
      // Arrange
      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message',
        TestUser.NON_SPACE_MEMBER
      );

      // Assert
      expect(messageRes.error?.errors[0].message).toContain(
        `Authorization: unable to grant 'create-message' privilege: room send message: ${postCommentsIdSpace}`
      );
    });
    describe('Messages - GA Send/Remove flow', () => {
      test('GA should send comment on post created on space callout from GA', async () => {
        // Act
        const messageRes = await sendMessageToRoom(
          postCommentsIdSpace,
          'test message',
          TestUser.GLOBAL_ADMIN
        );
        msessageId = messageRes?.data?.sendMessageToRoom.id;
        const postsData = await getPostData(spacePostId);

        // Assert
        expect(postsData.data?.lookup.post?.comments).toEqual({
          id: postCommentsIdSpace,
          messagesCount: 1,
          messages: [
            {
              id: msessageId,
              message: 'test message',
              sender: { id: users.globalAdmin.id },
            },
          ],
        });
      });

      test('GA should remove comment on post created on space callout from GA', async () => {
        // Act
        await removeMessageOnRoom(
          postCommentsIdSpace,
          msessageId,
          TestUser.GLOBAL_ADMIN
        );
        const postsData = await getPostData(spacePostId);

        // Assert
        expect(postsData.data?.lookup.post?.comments.messages).toHaveLength(0);
      });
    });
  });
  describe('Delete Message - Post created by HM on Space callout', () => {
    beforeAll(async () => {
      const resPostonSpace = await createPostOnCallout(
        entitiesId.space.calloutId,
        { displayName: `em-asp-d-space-mess-${uniqueId}` },
        `em-asp-n-spa-mess-${uniqueId}`,
        TestUser.SPACE_MEMBER
      );
      spacePostId =
        resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
      postCommentsIdSpace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';

      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message',
        TestUser.GLOBAL_ADMIN
      );

      msessageId = messageRes?.data?.sendMessageToRoom.id;
      await delay(1000);
    });

    afterAll(async () => {
      await deletePost(spacePostId);
    });

    test('HM should NOT delete comment sent from GA', async () => {
      // Act
      const removeMessageRes = await removeMessageOnRoom(
        postCommentsIdSpace,
        msessageId,
        TestUser.SPACE_MEMBER
      );

      // Assert
      expect(removeMessageRes.error?.errors[0].message).toContain(
        `Authorization: unable to grant 'delete' privilege: room remove message: ${postCommentsIdSpace}`
      );
    });

    test('NON-HM should NOT delete comment sent from GA', async () => {
      // Act
      const removeMessageRes = await removeMessageOnRoom(
        postCommentsIdSpace,
        msessageId,
        TestUser.NON_SPACE_MEMBER
      );

      // Assert
      expect(removeMessageRes.error?.errors[0].message).toContain(
        `Authorization: unable to grant 'delete' privilege: room remove message: ${postCommentsIdSpace}`
      );
    });

    test('GA should remove comment sent from GA', async () => {
      // Act
      await removeMessageOnRoom(
        postCommentsIdSpace,
        msessageId,
        TestUser.GLOBAL_ADMIN
      );
      const postsData = await getPostData(spacePostId);

      // Assert
      expect(postsData.data?.lookup.post?.comments.messages).toHaveLength(0);
    });

    test('HM should delete own comment', async () => {
      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message',
        TestUser.SPACE_MEMBER
      );

      msessageId = messageRes?.data?.sendMessageToRoom.id;
      await delay(1000);

      // Act
      await removeMessageOnRoom(
        postCommentsIdSpace,
        msessageId,
        TestUser.SPACE_MEMBER
      );
      const postsData = await getPostData(spacePostId);

      // Assert
      expect(postsData.data?.lookup.post?.comments.messages).toHaveLength(0);
    });
  });
});

describe('Posts - References', () => {
  const refname = 'brum';
  let refId = '';
  let postProfileId = '';

  beforeAll(async () => {
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,

      { displayName: 'test' },
      `asp-n-id-up-${uniqueId}`
    );
    spacePostId =
      resPostonSpace?.data?.createContributionOnCallout?.post?.id ?? '';
    postProfileId =
      resPostonSpace?.data?.createContributionOnCallout?.post?.profile.id ?? '';
  });

  afterAll(async () => {
    await deletePost(spacePostId);
  });

  test('HM should NOT add reference to post created on space callout from GA', async () => {
    // Arrange
    const createRef = await createReferenceOnProfile(
      postProfileId,
      refname,
      TestUser.SPACE_MEMBER
    );

    // Act
    expect(createRef.error?.errors[0].message).toContain(
      `Authorization: unable to grant 'create' privilege: profile: ${postProfileId}`
    );
  });

  test('NON-HM should NOT add reference to post created on space callout from GA', async () => {
    // Arrange
    const createRef = await createReferenceOnProfile(
      postProfileId,
      refname,
      TestUser.NON_SPACE_MEMBER
    );

    // Act
    expect(createRef.error?.errors[0].message).toContain(
      `Authorization: unable to grant 'create' privilege: profile: ${postProfileId}`
    );
  });

  describe('References - EA Create/Remove flow', () => {
    test('HA should add reference to post created on space callout from GA', async () => {
      // Arrange
      const createRef = await createReferenceOnProfile(
        postProfileId,
        refname,
        TestUser.SPACE_ADMIN
      );
      refId = createRef?.data?.createReferenceOnProfile.id ?? '';

      // Act
      const postsData = await getPostData(spacePostId);

      // Assert
      expect(
        postsData.data?.lookup.post?.profile.references?.[0]
      ).toMatchObject({
        id: refId,
        name: refname,
      });
    });

    test('HA should remove reference from post created EA', async () => {
      // Arrange
      await deleteReferenceOnProfile(refId, TestUser.SPACE_ADMIN);

      // Act
      const postsData = await getPostData(spacePostId);

      // Assert
      expect(postsData.data?.lookup.post?.profile.references).toHaveLength(0);
    });
  });
});
