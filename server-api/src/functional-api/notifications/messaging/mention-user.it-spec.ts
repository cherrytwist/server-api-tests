/* eslint-disable prettier/prettier */
import { deleteMailSlurperMails, getMailsData } from '@utils/mailslurper.rest.requests';
import { delay } from '@alkemio/tests-lib';
import { TestUser } from '@alkemio/tests-lib';
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import { createPostOnCallout } from '@functional-api/callout/post/post.request.params';
import { PreferenceType } from '@generated/alkemio-schema';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
import { testConfiguration } from '@src/config/test.configuration';

const uniqueId = UniqueIDGenerator.getID();

let postCommentsIdSpace = '';
let postCommentsIdSubspace = '';
let postCommentsIdSubsubspace = '';

const receivers = (senderDisplayName: string) => {
  return `${senderDisplayName} mentioned you in a comment on Alkemio`;
};

const baseUrl = testConfiguration.endPoints.server + '/user';

const mentionedUser = (userDisplayName: string, userNameId: string) => {
  return `[@${userDisplayName}](${baseUrl}/${userNameId})`;
};

let preferencesConfig: any[] = [];

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'messaging-mention-user',
  space: {
    collaboration: {
      addCallouts: true,
    },
    community: {
        addAdmin: true,
        addMembers: true,
      },
      subspace: {
      collaboration: {
        addCallouts: true,
      },
      community: {
        addAdmin: true,
        addMembers: true,
      },
      subspace: {
        collaboration: {
          addCallouts: true,
        },
        community: {
          addAdmin: true,
          addMembers: true,
        },
      },
    },
  },
};

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);

  await changePreferenceUser(
    users.globalAdmin.id,
    PreferenceType.NotificationPostCommentCreated,
    'false'
  );

  preferencesConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationCommunicationMention,
    },
  ];

  preferencesConfig.forEach(
    async config =>
      await changePreferenceUser(config.userID, config.type, 'true')
  );
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});
describe('Notifications - Mention User', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  describe('Callout discussion', () => {
    test('GA mention HM in Space comments callout - 1 notification to HM is sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.space.collaboration.calloutPostCommentsId,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.GLOBAL_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(1);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.globalAdmin.displayName),
            toAddresses: [users.spaceMember.email],
          }),
        ])
      );
    });

    test('HM mention Non Space member in Space comments callout - 1 notification to NonHM is sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.space.collaboration.calloutPostCommentsId,
        `${mentionedUser(
          users.nonSpaceMember.displayName,
          users.nonSpaceMember.nameId
        )} comment on discussion callout`,
        TestUser.SPACE_MEMBER
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(1);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.spaceMember.displayName),
            toAddresses: [users.nonSpaceMember.email],
          }),
        ])
      );
    });

    test('HM mention Non Space member and Space Admin in Space comments callout - 2 notification to NonHM and HA is sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.space.collaboration.calloutPostCommentsId,
        `${mentionedUser(
          users.nonSpaceMember.displayName,
          users.nonSpaceMember.nameId
        )}, ${mentionedUser(
          users.spaceAdmin.displayName,
          users.spaceAdmin.nameId
        )}  comment on discussion callout`,
        TestUser.SPACE_MEMBER
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(2);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.spaceMember.displayName),
            toAddresses: [users.nonSpaceMember.email],
          }),
          expect.objectContaining({
            subject: receivers(users.spaceMember.displayName),
            toAddresses: [users.spaceAdmin.email],
          }),
        ])
      );
    });

    test('Non Space member mention HM in Space comments callout - 0 notification to HM is sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.space.collaboration.calloutPostCommentsId,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.NON_SPACE_MEMBER
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(0);
    });

    test('GA mention HM in Subspace comments callout - 1 notification to HM is sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.subspace.collaboration.calloutPostCommentsId,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.GLOBAL_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(1);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.globalAdmin.displayName),
            toAddresses: [users.spaceMember.email],
          }),
        ])
      );
    });

    test('GA mention HM in Subsubspace comments callout - 1 notification to HM is sent', async () => {
      // Act

      await sendMessageToRoom(
        baseScenario.subsubspace.collaboration.calloutPostCommentsId,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.GLOBAL_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(1);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.globalAdmin.displayName),
            toAddresses: [users.spaceMember.email],
          }),
        ])
      );
    });
  });

  describe('Post comment', () => {
    beforeAll(async () => {
      let postNameID = '';
      postNameID = `post-name-id-${uniqueId}`;
      const postDisplayName = `post-d-name-${uniqueId}`;
      const resPostonSpace = await createPostOnCallout(
        baseScenario.space.collaboration.calloutPostCollectionId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.GLOBAL_ADMIN
      );
      postCommentsIdSpace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';

      const resPostonSubspace = await createPostOnCallout(
        baseScenario.subspace.collaboration.calloutPostCollectionId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.SUBSPACE_MEMBER
      );
      postCommentsIdSubspace =
        resPostonSubspace.data?.createContributionOnCallout.post?.comments
          .id ?? '';

      const resPostonOpp = await createPostOnCallout(
        baseScenario.subsubspace.collaboration.calloutPostCollectionId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.SUBSUBSPACE_MEMBER
      );
      postCommentsIdSubsubspace =
        resPostonOpp.data?.createContributionOnCallout.post?.comments.id ?? '';

      await delay(3000);
      await deleteMailSlurperMails();
    });

    test('HA mention HM in Space post - 1 notification to HM is sent', async () => {
      // Act
      await sendMessageToRoom(
        postCommentsIdSpace,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.SPACE_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(1);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.spaceAdmin.displayName),
            toAddresses: [users.spaceMember.email],
          }),
        ])
      );
    });

    test('CA mention HM in Subspace post - 1 notification to HM is sent', async () => {
      // Act
      await sendMessageToRoom(
        postCommentsIdSubspace,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.SUBSPACE_MEMBER
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(1);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.subspaceMember.displayName),
            toAddresses: [users.spaceMember.email],
          }),
        ])
      );
    });

    test('OA mention HM in Subsubspace post - 1 notification to HM is sent', async () => {
      // Act
      await sendMessageToRoom(
        postCommentsIdSubsubspace,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.SUBSUBSPACE_MEMBER
      );

      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(1);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(users.subsubspaceMember.displayName),
            toAddresses: [users.spaceMember.email],
          }),
        ])
      );
    });

    test('OA mention HM in Subsubspace post (preference disabled) - 0 notification to HM is sent', async () => {
      // Arrange
      preferencesConfig.forEach(
        async config =>
          await changePreferenceUser(config.userID, config.type, 'false')
      );

      // Act
      await sendMessageToRoom(
        postCommentsIdSubsubspace,
        `${mentionedUser(
          users.spaceMember.displayName,
          users.spaceMember.nameId
        )} comment on discussion callout`,
        TestUser.SUBSUBSPACE_MEMBER
      );

      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(0);
    });
  });

  // ToDo: add timeline comments mentions, when implemented
  describe.skip('Post comment', () => {
    test('OA mention HM in Subsubspace post - 1 notification to HM is sent', async () => {
      expect(1).toEqual(1);
    });
  });
});
