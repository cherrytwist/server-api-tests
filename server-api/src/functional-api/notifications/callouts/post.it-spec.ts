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
let preferencesConfig: any[] = [];

const templatedAdminResult = async (entityName: string, userEmail: string) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: entityName,
      toAddresses: [userEmail],
    }),
  ]);
};

const templateMemberResult = async (entityName: string, userEmail: string) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: entityName,
      toAddresses: [userEmail],
    }),
  ]);
};

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

  preferencesConfig = [
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
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Notifications - post', () => {
  let postNameID = '';

  beforeEach(async () => {
    await deleteMailSlurperMails();

    postNameID = `asp-name-id-${uniqueId}`;
    postDisplayName = `asp-d-name-${uniqueId}`;
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

    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'true')
    );
  });

  afterEach(async () => {
    await deletePost(spacePostId);
    await deletePost(subspacePostId);
    await deletePost(subsubspacePostId);
  });

  //ToDo: fix test
  test.skip('GA create space post - GA(1), HA (2), HM(6) get notifications', async () => {
    const postSubjectAdmin = `${spaceName}: New Post created by admin`;
    const postSubjectMember = `${spaceName}: New Post created by admin, have a look!`;

    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.GLOBAL_ADMIN
    );
    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    await delay(6000);
    const mails = await getMailsData();
    expect(mails[0]).toEqual(
      await templatedAdminResult(postSubjectAdmin, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAdminResult(postSubjectAdmin, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.globalAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.spaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceAdmin.email
      )
    );
    expect(mails[1]).toEqual(9);
    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceMember.email
      )
    );
  });

  test('HA create space post - GA(1), HA (1), HM(6) get notifications', async () => {
    const postSubjectAdmin = `${spaceName}: New Post created by space`;
    const postSubjectMember = `${spaceName}: New Post created by space, have a look!`;
    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.space.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SPACE_ADMIN
    );
    spacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(9);

    expect(mails[0]).toEqual(
      await templatedAdminResult(postSubjectAdmin, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAdminResult(postSubjectAdmin, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.globalAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.spaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceAdmin.email
      )
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceMember.email
      )
    );
  });

  test('HA create subspace post - GA(1), HA (1), CA(1), CM(3),  get notifications', async () => {
    const postSubjectAdmin = `${subspaceName}: New Post created by space`;
    const postSubjectMember = `${subspaceName}: New Post created by space, have a look!`;
    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.subspace.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SPACE_ADMIN
    );
    subspacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    await delay(6000);
    const mails = await getMailsData();
    expect(mails[0]).toEqual(
      await templatedAdminResult(postSubjectAdmin, users.globalAdmin.email)
    );

    // Space admin does not reacive email
    expect(mails[0]).not.toEqual(
      await templatedAdminResult(postSubjectAdmin, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.globalAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectAdmin, users.subspaceAdmin.email)
    );

    // Space member does not reacive email
    expect(mails[0]).not.toEqual(
      await templateMemberResult(postSubjectMember, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceAdmin.email
      )
    );
    expect(mails[1]).toEqual(7);
    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceMember.email
      )
    );
  });

  test('OM create subsubspace post - HA(2), CA(1), OA(2), OM(4), get notifications', async () => {
    const postSubjectAdmin = `${subsubspaceName}: New Post created by subsubspace`;
    const postSubjectMember = `${subsubspaceName}: New Post created by subsubspace, have a look!`;
    // Act
    const resPostonSpace = await createPostOnCallout(
      entitiesId.subsubspace.calloutId,
      { displayName: postDisplayName },
      postNameID,
      TestUser.SUBSUBSPACE_MEMBER
    );
    subsubspacePostId =
      resPostonSpace.data?.createContributionOnCallout.post?.id ?? '';

    await delay(6000);
    const mails = await getMailsData();
    expect(mails[0]).toEqual(
      await templatedAdminResult(postSubjectAdmin, users.globalAdmin.email)
    );

    // Space admin does not reacive email
    expect(mails[0]).not.toEqual(
      await templatedAdminResult(postSubjectAdmin, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectMember, users.globalAdmin.email)
    );

    // Space admin does not reacive email
    expect(mails[0]).not.toEqual(
      await templateMemberResult(postSubjectMember, users.spaceAdmin.email)
    );

    // Space member does not reacive email
    expect(mails[0]).not.toEqual(
      await templateMemberResult(postSubjectMember, users.spaceMember.email)
    );

    // Subspace admin does not reacive email
    expect(mails[0]).not.toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceAdmin.email)
    );

    // Subspace member does not reacive email
    expect(mails[0]).not.toEqual(
      await templateMemberResult(postSubjectMember, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateMemberResult(postSubjectAdmin, users.subsubspaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceAdmin.email
      )
    );

    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceAdmin.email
      )
    );
    expect(mails[1]).toEqual(5);

    expect(mails[0]).toEqual(
      await templateMemberResult(
        postSubjectMember,
        users.subsubspaceMember.email
      )
    );
  });

  test('OA create subsubspace post - 0 notifications - all roles with notifications disabled', async () => {
    preferencesConfig.forEach(
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

    // Assert
    await delay(1500);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(0);
  });
});
