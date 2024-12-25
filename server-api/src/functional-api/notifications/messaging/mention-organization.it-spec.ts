/* eslint-disable prettier/prettier */
import { deleteMailSlurperMails } from '../../../utils/mailslurper.rest.requests';
import { delay } from '../../../../../lib/src/utils/delay';
import { TestUser } from '@alkemio/tests-lib';
import { deleteOrganization, updateOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { users } from '../../../utils/queries/users-data';
import {
  createPostOnCallout,
} from '@functional-api/callout/post/post.request.params';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { getMailsData } from '../../../types/entities-helper';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { PreferenceType } from '@generated/graphql';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';

const uniqueId = UniqueIDGenerator.getID();
let postCommentsIdSpace = '';

const receivers = (senderDisplayName: string, orgDisplayName: string) => {
  return `${senderDisplayName} mentioned ${orgDisplayName} in a comment on Alkemio`;
};

const baseUrl = process.env.ALKEMIO_BASE_URL + '/organization';

const mentionedOrganization = (userDisplayName: string, userNameId: string) => {
  return `[@${userDisplayName}](${baseUrl}/${userNameId})`;
};

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await OrganizationWithSpaceModelFactory.createOrganizationWithSpaceAndUsers();

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.space.id,
    'notification-orgMention-subspace',
    baseScenario.subspace
  );

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.subspace.id,
    'notification-orgMention-subsubspace',
    baseScenario.subsubspace
  );

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
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
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
