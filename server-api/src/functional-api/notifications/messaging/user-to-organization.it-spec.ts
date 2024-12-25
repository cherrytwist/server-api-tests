/* eslint-disable prettier/prettier */

import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import { delay } from '@alkemio/tests-lib';
import { TestUser } from '@alkemio/tests-lib';
import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { users } from '@utils/queries/users-data';
import { createOrgAndSpaceWithUsers } from '@utils/data-setup/entities';
import { sendMessageToOrganization } from '@functional-api/communications/communication.params';
import {
  entitiesId,
  getMailsData,
} from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';
import { updateUserSettingCommunicationMessage } from '@functional-api/contributor-management/user/user.request.params';

const firstOrganizationName = 'sample-org-name' + uniqueId;
const hostNameId = 'sample-org-nameid' + uniqueId;
const spaceName = '111' + uniqueId;
const spaceNameId = '111' + uniqueId;

let preferencesConfig: any[] = [];
let receivers = '';
let sender = '';

beforeAll(async () => {
  await deleteMailSlurperMails();

  await createOrgAndSpaceWithUsers(
    firstOrganizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );

  await assignUserAsOrganizationAdmin(
    users.spaceAdmin.id,
    entitiesId.organization.id
  );

  await assignUserAsOrganizationAdmin(
    users.spaceMember.id,
    entitiesId.organization.id
  );

  receivers = `${users.nonSpaceMember.displayName} sent a message to your organization`;
  sender = `You have sent a message to ${firstOrganizationName}!`;

  preferencesConfig = [
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationOrganizationMessage,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationOrganizationMessage,
    },
  ];
});

afterAll(async () => {
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Notifications - user to organization messages', () => {
  beforeAll(async () => {
    for (const config of preferencesConfig)
      await changePreferenceUser(config.userID, config.type, 'true');
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test("User 'A' sends message to Organization(both admins ORGANIZATION_MESSAGE:true) (3 admins) - 4 messages are sent", async () => {
    // Act
    await sendMessageToOrganization(
      entitiesId.organization.id,
      'Test message',
      TestUser.NON_SPACE_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(4);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.spaceAdmin.email],
        }),
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.spaceMember.email],
        }),
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: sender,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test("User 'A' sends message to Organization (3 admins, one admin has ORGANIZATION_MESSAGE:false) - 3 messages are sent", async () => {
    // Arrange
    await changePreferenceUser(
      users.spaceAdmin.id,
      PreferenceType.NotificationOrganizationMessage,
      'false'
    );
    // Act
    await sendMessageToOrganization(
      entitiesId.organization.id,
      'Test message',
      TestUser.NON_SPACE_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.spaceMember.email],
        }),
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: sender,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  // first admin has ORGANIZATION_MESSAGE:true and COMMUNICATION_MESSAGE:true
  // second admin has ORGANIZATION_MESSAGE:true and COMMUNICATION_MESSAGE:false
  test("User 'A' sends message to Organization (3 admins, one admin has ORGANIZATION_MESSAGE:true and COMMUNICATION_MESSAGE:false) - 4 messages are sent", async () => {
    // Arrange
    await changePreferenceUser(
      users.spaceAdmin.id,
      PreferenceType.NotificationOrganizationMessage,
      'true'
    );
    await updateUserSettingCommunicationMessage(
      users.spaceAdmin.id,
      false
    );
    // Act
    await sendMessageToOrganization(
      entitiesId.organization.id,
      'Test message',
      TestUser.NON_SPACE_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(4);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.spaceAdmin.email],
        }),
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.spaceMember.email],
        }),
        expect.objectContaining({
          subject: receivers,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: sender,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });
});
