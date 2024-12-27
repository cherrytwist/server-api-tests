/* eslint-disable prettier/prettier */
import { delay, TestUser } from '@alkemio/tests-lib';
import { updateOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { users } from '../../../scenario/TestUser';
import { createPostOnCallout } from '@functional-api/callout/post/post.request.params';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { PreferenceType } from '@generated/graphql';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
import { testConfiguration } from '@src/config/test.configuration';
import { deleteMailSlurperMails, getMailsData } from '@utils/mailslurper.rest.requests';

const uniqueId = UniqueIDGenerator.getID();
let postCommentsIdSpace = '';

const receivers = (senderDisplayName: string, orgDisplayName: string) => {
  return `${senderDisplayName} mentioned ${orgDisplayName} in a comment on Alkemio`;
};

const baseUrl = testConfiguration.endPoints.server + '/organization';

const mentionedOrganization = (userDisplayName: string, userNameId: string) => {
  return `[@${userDisplayName}](${baseUrl}/${userNameId})`;
};

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'messaging-mention-org',
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

  await updateOrganization(baseScenario.organization.id, {
    legalEntityName: 'legalEntityName',
    domain: 'domain',
    website: 'https://website.org',
    contactEmail: 'test-org@alkem.io',
  });

  await assignUserAsOrganizationAdmin(
    users.qaUser.id,
    baseScenario.organization.id
  );

  await changePreferenceUser(
    users.globalAdmin.id,
    PreferenceType.NotificationPostCommentCreated,
    'false'
  );

  // preferencesConfig = [
  //   {
  //     organizationID: baseScenario.organization.id,
  //     type: PreferenceType.NotificationOrganizationMention,
  //   },
  // ];

  // preferencesConfig.forEach(
  //   async config =>
  //     await changePreferenceOrganization(
  //       config.organizationID,
  //       config.type,
  //       'true'
  //     )
  // );
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});
describe('Notifications - Mention Organization', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  describe('Callout discussion', () => {
    test('GA mention Organization in Space comments callout - 2 notification to Organization admins are sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.space.collaboration.calloutPostCommentsId,
        `${mentionedOrganization(
          baseScenario.organization.profile.displayName,
          baseScenario.organization.nameId
        )} comment on discussion callout`,
        TestUser.GLOBAL_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(2);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(
              users.globalAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.qaUser.email],
          }),
          expect.objectContaining({
            subject: receivers(
              users.globalAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.globalAdmin.email],
          }),
        ])
      );
    });

    test('HM mention Organization in Space comments callout - 2 notification to Organization admins are sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.space.collaboration.calloutPostCommentsId,
        `${mentionedOrganization(
          baseScenario.organization.profile.displayName,
          baseScenario.organization.nameId
        )} comment on discussion callout`,
        TestUser.SPACE_MEMBER
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(2);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(
              users.spaceMember.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.qaUser.email],
          }),
          expect.objectContaining({
            subject: receivers(
              users.spaceMember.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.globalAdmin.email],
          }),
        ])
      );
    });

    test('GA mention Organization in Subspace comments callout - 2 notification to Organization admins are sent', async () => {
      // Act
      await sendMessageToRoom(
        baseScenario.subspace.collaboration.calloutPostCommentsId,
        `${mentionedOrganization(
          baseScenario.organization.profile.displayName,
          baseScenario.organization.nameId
        )} comment on discussion callout`,
        TestUser.GLOBAL_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(2);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(
              users.globalAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.qaUser.email],
          }),
          expect.objectContaining({
            subject: receivers(
              users.globalAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.globalAdmin.email],
          }),
        ])
      );
    });

    test('GA mention Organization in Subsubspace comments callout - 2 notification to Organization admins are sent', async () => {
      // Act

      await sendMessageToRoom(
        baseScenario.subsubspace.collaboration.calloutPostCommentsId,
        `${mentionedOrganization(
          baseScenario.organization.profile.displayName,
          baseScenario.organization.nameId
        )} comment on discussion callout`,
        TestUser.GLOBAL_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(2);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(
              users.globalAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.qaUser.email],
          }),
          expect.objectContaining({
            subject: receivers(
              users.globalAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.globalAdmin.email],
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

      await delay(3000);
      await deleteMailSlurperMails();
    });

    test('HA mention Organization in Space post - 2 notification to Organization admins are sent', async () => {
      // Act
      await sendMessageToRoom(
        postCommentsIdSpace,
        `${mentionedOrganization(
          baseScenario.organization.profile.displayName,
          baseScenario.organization.nameId
        )} comment on discussion callout`,
        TestUser.SPACE_ADMIN
      );
      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(2);
      expect(getEmailsData[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: receivers(
              users.spaceAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.qaUser.email],
          }),
          expect.objectContaining({
            subject: receivers(
              users.spaceAdmin.displayName,
              baseScenario.organization.profile.displayName
            ),
            toAddresses: [users.globalAdmin.email],
          }),
        ])
      );
    });

    test('HA mention Organization in Subsubspace post (preference disabled) - 2 notification to Organization admins are sent', async () => {
      // Arrange
      // preferencesConfig.forEach(
      //   async config =>
      //     await changePreferenceOrganization(
      //       config.organizationID,
      //       config.type,
      //       'false'
      //     )
      // );

      // Act
      await sendMessageToRoom(
        postCommentsIdSpace,
        `${mentionedOrganization(
          baseScenario.organization.profile.displayName,
          baseScenario.organization.nameId
        )} comment on discussion callout`,
        TestUser.SPACE_ADMIN
      );

      await delay(3000);

      const getEmailsData = await getMailsData();

      // Assert
      expect(getEmailsData[1]).toEqual(2);
    });
  });

  // ToDo: add timeline comments mentions, when implemented
  describe.skip('Post comment', () => {
    test('OA mention HM in Subsubspace post - 1 notification to HM is sent', async () => {
      expect(1).toEqual(1);
    });
  });
});
