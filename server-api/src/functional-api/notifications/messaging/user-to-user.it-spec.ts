/* eslint-disable prettier/prettier */
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import { delay } from '@utils/delay';
import { TestUser } from '@common/enum/test.user';
import { users } from '@utils/queries/users-data';
import { sendMessageToUser } from '@functional-api/communications/communication.params';
import { getMailsData } from '@src/types/entities-helper';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';
import { updateUserSettingCommunicationMessage } from '@functional-api/contributor-management/user/user.request.params';

let receiver_userDisplayName = '';
let sender_userDisplayName = '';
let usersList: any[] = [];
let receiver = '';
let sender = '';

const receivers = (senderDisplayName: string) => {
  return `${senderDisplayName} sent you a message!`;
};

beforeAll(async () => {
  await deleteMailSlurperMails();

  receiver_userDisplayName = users.globalAdmin.displayName;
  sender_userDisplayName = users.nonSpaceMember.displayName;

  receiver = `${sender_userDisplayName} sent you a message!`;
  sender = `You have sent a message to ${receiver_userDisplayName}!`;

  usersList = [users.globalAdmin.id,users.nonSpaceMember.id, users.qaUser.id];
});

describe('Notifications - user to user messages', () => {
  beforeAll(async () => {
    for (const user of usersList)
      await updateUserSettingCommunicationMessage(user.userID, true);
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test("User 'A'(pref:true) send message to user 'B'(pref:true) - 2 messages are sent", async () => {
    // Act
    await sendMessageToUser(
      [users.globalAdmin.id],
      'Test message',
      TestUser.NON_HUB_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(2);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receiver,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: sender,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  // Skipping until behavior is cleared, whather the bahavior of receiving email for each sent message is right
  test.skip("User 'A'(pref:true) send message to 2 users: 'B' and 'C'(pref:true) - 3 messages are sent", async () => {
    // Act
    await sendMessageToUser(
      [users.globalAdmin.id, users.qaUser.id],
      'Test message',
      TestUser.NON_HUB_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers(users.nonSpaceMember.displayName),
          toAddresses: [users.qaUser.email],
        }),
        expect.objectContaining({
          subject: receivers(users.nonSpaceMember.displayName),
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: sender,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  // Skipping until behavior is cleared, whather the bahavior of receiving email for each sent message is right
  test.skip("User 'A'(pref:true) send message to 2 users: 'B'(pref:true) and 'C'(pref:false) - 2 messages are sent", async () => {
    // Arrange
    await updateUserSettingCommunicationMessage(
      users.qaUser.id,
      false
    );

    // Act
    await sendMessageToUser(
      [users.globalAdmin.id, users.qaUser.id],
      'Test message',
      TestUser.NON_HUB_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(2);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers(users.nonSpaceMember.displayName),
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: sender,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
    await updateUserSettingCommunicationMessage(
      users.qaUser.id,
      true
    );
  });

  test("User 'A'(pref:true) send message to user 'B'(pref:false) - 1 messages are sent", async () => {
    // Arrange
    await updateUserSettingCommunicationMessage(
      users.globalAdmin.id,
      false
    );

    // Act
    await sendMessageToUser(
      [users.globalAdmin.id],
      'Test message',
      TestUser.NON_HUB_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: sender,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test("User 'A'(pref:false) send message to user 'B'(pref:true) - 2 messages are sent", async () => {
    // Arrange
    await updateUserSettingCommunicationMessage(
      users.globalAdmin.id,
      true
    );

    await updateUserSettingCommunicationMessage(
      users.nonSpaceMember.id,
      false
    );

    // Act
    await sendMessageToUser(
      [users.globalAdmin.id],
      'Test message',
      TestUser.NON_HUB_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(2);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receiver,
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
