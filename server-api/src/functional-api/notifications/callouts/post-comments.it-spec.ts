import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();
import { TestUser } from '@alkemio/tests-lib';
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { delay } from '@alkemio/tests-lib';
import {
  createPostOnCallout,
  deletePost,
} from '@functional-api/callout/post/post.request.params';
import { users } from '@utils/queries/users-data';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import {
  removeMessageOnRoom,
  sendMessageToRoom,
} from '@functional-api/communications/communication.params';
import { entitiesId, getMailsData } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';

const organizationName = 'not-up-org-name' + uniqueId;
const hostNameId = 'not-up-org-nameid' + uniqueId;
const spaceName = 'not-up-eco-name' + uniqueId;
const spaceNameId = 'not-up-eco-nameid' + uniqueId;
const subspaceName = `chName${uniqueId}`;
const subsubspaceName = `opName${uniqueId}`;
let spacePostId = '';
let subspacePostId = '';
let subsubspacePostId = '';
let postDisplayName = '';
let postCommentsIdSpace = '';
let postCommentsIdSubspace = '';
let postCommentsIdSubsubspace = '';
let messageId = '';
let preferencesPostConfig: any[] = [];
let preferencesPostCommentsConfig: any[] = [];

beforeAll(async () => {
  await deleteMailSlurperMails();

  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createSubspaceWithUsers(subspaceName);
  await createSubsubspaceWithUsers(subsubspaceName);

  preferencesPostConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },

    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },

    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },

    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },

    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },
    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationPostCreated,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationPostCreatedAdmin,
    },
  ];

  preferencesPostCommentsConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationPostCommentCreated,
    },
  ];
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Notifications - post comments', () => {
  let postNameID = '';
  postNameID = `post-name-id-${uniqueId}`;
  postDisplayName = `post-d-name-${uniqueId}`;
  beforeEach(async () => {
    await deleteMailSlurperMails();

    postNameID = `post-name-id-${uniqueId}`;
    postDisplayName = `post-d-name-${uniqueId}`;
  });

  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationPostCommentCreated,
      'false'
    );
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationPostCreated,
      'false'
    );
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationPostCreatedAdmin,
      'false'
    );

    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationPostCommentCreated,
      'false'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationPostCreated,
      'false'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationPostCreatedAdmin,
      'false'
    );
    preferencesPostConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );

    preferencesPostCommentsConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'true')
    );
  });

  afterEach(async () => {
    await delay(6000);
    await removeMessageOnRoom(
      postCommentsIdSpace,
      messageId,
      TestUser.GLOBAL_ADMIN
    );
  });
  describe('GA create post on space  ', () => {
    beforeAll(async () => {
      const resPostonSpace = await createPostOnCallout(
        entitiesId.space.calloutId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.GLOBAL_ADMIN
      );
      spacePostId =
        resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
      postCommentsIdSpace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';
    });

    afterAll(async () => {
      await deletePost(spacePostId);
    });
    test('GA create comment - GA(1) get notifications', async () => {
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message on space post',
        TestUser.GLOBAL_ADMIN
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();
      expect(mails[1]).toEqual(0);
    });

    test('HM create comment - GA(1) get notifications', async () => {
      const spacePostSubjectText = `${spaceName} - New comment received on your Post &#34;${postDisplayName}&#34;, have a look!`;
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message on space post',
        TestUser.SPACE_MEMBER
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();

      expect(mails[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: spacePostSubjectText,
            toAddresses: [users.globalAdmin.email],
          }),
        ])
      );

      expect(mails[1]).toEqual(1);
    });
  });

  describe('HM create post on space  ', () => {
    beforeAll(async () => {
      const resPostonSpace = await createPostOnCallout(
        entitiesId.space.calloutId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.SPACE_MEMBER
      );
      spacePostId =
        resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
      postCommentsIdSpace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';
    });

    afterAll(async () => {
      await deletePost(spacePostId);
    });
    test('HM create comment - HM(1) get notifications', async () => {
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message on space post',
        TestUser.SPACE_MEMBER
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();

      expect(mails[1]).toEqual(0);
    });

    test('HA create comment - HM(1) get notifications', async () => {
      const spacePostSubjectText = `${spaceName} - New comment received on your Post &#34;${postDisplayName}&#34;, have a look!`;
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSpace,
        'test message on space post',
        TestUser.SPACE_ADMIN
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();

      expect(mails[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: spacePostSubjectText,
            toAddresses: [users.spaceMember.email],
          }),
        ])
      );

      expect(mails[1]).toEqual(1);
    });
  });

  describe('CM create post on subspace  ', () => {
    beforeAll(async () => {
      const resPostonSpace = await createPostOnCallout(
        entitiesId.subspace.calloutId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.SUBSPACE_MEMBER
      );
      subspacePostId =
        resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
      postCommentsIdSubspace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';
    });

    afterAll(async () => {
      await deletePost(subspacePostId);
    });
    test('CM create comment - CM(1) get notifications', async () => {
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSubspace,
        'test message on subspace post',
        TestUser.SUBSPACE_MEMBER
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();

      expect(mails[1]).toEqual(0);
    });

    test('CA create comment - CM(1) get notifications', async () => {
      const subspacePostSubjectText = `${subspaceName} - New comment received on your Post &#34;${postDisplayName}&#34;, have a look!`;
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSubspace,
        'test message on subspace post',
        TestUser.SUBSPACE_ADMIN
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();

      expect(mails[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: subspacePostSubjectText,
            toAddresses: [users.subspaceMember.email],
          }),
        ])
      );

      expect(mails[1]).toEqual(1);
    });
  });

  describe('OM create post on subsubspace  ', () => {
    beforeAll(async () => {
      const resPostonSpace = await createPostOnCallout(
        entitiesId.subsubspace.calloutId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.SUBSUBSPACE_MEMBER
      );
      subsubspacePostId =
        resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
      postCommentsIdSubsubspace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';
    });

    afterAll(async () => {
      await deletePost(subsubspacePostId);
    });
    test('OM create comment - OM(1) get notifications', async () => {
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSubsubspace,
        'test message on subsubspace post',
        TestUser.SUBSUBSPACE_MEMBER
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();

      expect(mails[1]).toEqual(0);
    });

    test('CA create comment - OM(1) get notifications', async () => {
      const subsubspacePostSubjectText = `${subsubspaceName} - New comment received on your Post &#34;${postDisplayName}&#34;, have a look!`;
      // Act
      const messageRes = await sendMessageToRoom(
        postCommentsIdSubsubspace,
        'test message on subsubspace post',
        TestUser.SUBSPACE_ADMIN
      );
      messageId = messageRes?.data?.sendMessageToRoom.id ?? '';

      await delay(6000);
      const mails = await getMailsData();

      expect(mails[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: subsubspacePostSubjectText,
            toAddresses: [users.subsubspaceMember.email],
          }),
        ])
      );

      expect(mails[1]).toEqual(1);
    });
  });

  test('OA create post on subsubspace and comment - 0 notifications - all roles with notifications disabled', async () => {
    preferencesPostCommentsConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );
    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.subsubspace.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SUBSUBSPACE_ADMIN
    );
    subsubspacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';
    postCommentsIdSubsubspace =
      resPostonSpace.data?.createContributionOnCallout.post?.comments.id ?? '';
    await sendMessageToRoom(
      postCommentsIdSubsubspace,
      'test message on subsubspace post',
      TestUser.SUBSUBSPACE_ADMIN
    );

    // Assert
    await delay(1500);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(0);
  });
});
