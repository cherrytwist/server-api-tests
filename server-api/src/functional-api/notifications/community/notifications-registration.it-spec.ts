import {
  createUser,
  deleteUser,
} from '@functional-api/contributor-management/user/user.request.params';
import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import { users } from '@utils/queries/users-data';
import { getMailsData } from '@src/types/entities-helper';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';
import { delay } from '@alkemio/tests-lib';

let userName = '';
let userId = '';
let userEmail = '';

beforeAll(async () => {
  await deleteMailSlurperMails();
  userName = `testuser${uniqueId}`;
  userEmail = `${uniqueId}@test.com`;
});

describe('Notifications - User registration', () => {
  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationUserSignUp,
      'false'
    );
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationUserRemoved,
      'false'
    );
    await changePreferenceUser(
      users.globalAdmin.id,
      PreferenceType.NotificationUserRemoved,
      'false'
    );
    await changePreferenceUser(
      users.globalAdmin.id,
      PreferenceType.NotificationUserSignUp,
      'true'
    );
    await changePreferenceUser(
      users.globalLicenseAdmin.id,
      PreferenceType.NotificationUserSignUp,
      'true'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationUserSignUp,
      'true'
    );
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  afterEach(async () => {
    await deleteUser(userId);
  });

  test('User sign up - GA(1), SA(1), New User(1) get notifications', async () => {
    // Act
    const response = await createUser({
      email: userEmail,
      profileData: { displayName: userName },
    });
    userId = response?.data?.createUser.id ?? '';

    await delay(6000);
    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `New user registration on Alkemio: ${userName}`,
          toAddresses: [users.globalAdmin.email],
        }),

        expect.objectContaining({
          subject: `New user registration on Alkemio: ${userName}`,
          toAddresses: [users.globalLicenseAdmin.email],
        }),

        expect.objectContaining({
          subject: 'Alkemio - Registration successful!',
          toAddresses: [userEmail],
        }),
      ])
    );
  });
  test('User sign up - GA(0), New User(1) get notifications', async () => {
    // Arrange
    await changePreferenceUser(
      users.globalAdmin.id,
      PreferenceType.NotificationUserSignUp,
      'false'
    );
    await changePreferenceUser(
      users.globalLicenseAdmin.id,
      PreferenceType.NotificationUserSignUp,
      'false'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationUserSignUp,
      'false'
    );

    // Act
    const response = await createUser({
      email: 'only' + userEmail,
      profileData: { displayName: userName + 'only' },
    });
    userId = response?.data?.createUser.id ?? '';

    await delay(7000);
    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: 'Alkemio - Registration successful!',
          toAddresses: ['only' + userEmail],
        }),
      ])
    );
  });
});
describe('Notifications - User removal', () => {
  test('User removed - GA(1) get notifications', async () => {
    // Arrange
    await changePreferenceUser(
      users.globalAdmin.id,
      PreferenceType.NotificationUserRemoved,
      'true'
    );

    // Act
    const response = await createUser({
      email: userEmail,
      profileData: { displayName: userName },
    });
    userId = response?.data?.createUser.id ?? '';

    await delay(6000);
    await deleteMailSlurperMails();
    await deleteUser(userId);
    await delay(7000);
    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `User profile deleted from the Alkemio platform: ${userName}`,
          toAddresses: [users.globalAdmin.email],
        }),
      ])
    );
  });
});
