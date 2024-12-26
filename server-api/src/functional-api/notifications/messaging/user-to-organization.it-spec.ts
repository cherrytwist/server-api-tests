import { deleteMailSlurperMails, getMailsData } from '@utils/mailslurper.rest.requests';
import { delay } from '@alkemio/tests-lib';
import { TestUser } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import { sendMessageToOrganization } from '@functional-api/communications/communication.params';
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';
import { updateUserSettingCommunicationMessage } from '@functional-api/contributor-management/user/user.request.params';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';

let preferencesConfig: any[] = [];
let receivers = '';
let sender = '';

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'messaging-user-to-organization',
  space: {
    collaboration: {
      addCallouts: true,
    },
    community: {
      addAdmin: true,
      addMembers: true,
    },
  },
};

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);

  await assignUserAsOrganizationAdmin(
    users.spaceAdmin.id,
    baseScenario.organization.id
  );

  await assignUserAsOrganizationAdmin(
    users.spaceMember.id,
    baseScenario.organization.id
  );

  receivers = `${users.nonSpaceMember.displayName} sent a message to your organization`;
  sender = `You have sent a message to ${baseScenario.organization.profile.displayName}!`;

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
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
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
      baseScenario.organization.id,
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
      baseScenario.organization.id,
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
    await updateUserSettingCommunicationMessage(users.spaceAdmin.id, false);
    // Act
    await sendMessageToOrganization(
      baseScenario.organization.id,
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
