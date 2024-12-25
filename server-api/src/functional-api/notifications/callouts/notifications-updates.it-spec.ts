import { UniqueIDGenerator } from '@alkemio/tests-lib';
const uniqueId = UniqueIDGenerator.getID();
import { TestUser } from '@alkemio/tests-lib';
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { delay } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { getMailsData } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';

const spaceName = 'not-up-eco-name' + uniqueId;
const ecoName = spaceName;
const subspaceName = `chName${uniqueId}`;
const subsubspaceName = `opName${uniqueId}`;
let preferencesConfig: any[] = [];

export const templatedAsAdminResult = async (
  entityName: string,
  userEmail: string
) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: `${entityName}: New update shared`,
      toAddresses: [userEmail],
    }),
  ]);
};

const templatedAsMemberResult = async (
  entityName: string,
  userEmail: string
) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: `${entityName} - New update, have a look!`,
      toAddresses: [userEmail],
    }),
  ]);
};

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await OrganizationWithSpaceModelFactory.createOrganizationWithSpaceAndUsers();

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.space.id,
    'notification-updates-subspace',
    baseScenario.subspace
  );

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.subspace.id,
    'notification-updates-subsubspace',
    baseScenario.subsubspace
  );

  preferencesConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdates,
    },
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdateSentAdmin,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationCommunicationUpdates,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationCommunicationUpdateSentAdmin,
    },
    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationCommunicationUpdates,
    },
    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationCommunicationUpdateSentAdmin,
    },
    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationCommunicationUpdates,
    },
    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationCommunicationUpdateSentAdmin,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdates,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdateSentAdmin,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdates,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdateSentAdmin,
    },
    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdates,
    },
    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationCommunicationUpdateSentAdmin,
    },
  ];
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

// Skip tests due to bug: #193
describe.skip('Notifications - updates', () => {
  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationCommunicationUpdates,
      'false'
    );
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationCommunicationUpdateSentAdmin,
      'false'
    );

    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationCommunicationUpdates,
      'false'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationCommunicationUpdateSentAdmin,
      'false'
    );

    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'true')
    );
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('GA create space update - GA(1), HA (1), HM(6) get notifications', async () => {
    // Act
    await sendMessageToRoom(baseScenario.space.communication.updatesId, 'GA space update ');

    await delay(6000);
    const mails = await getMailsData();

    // Assert
    expect(mails[1]).toEqual(9);
    expect(mails[0]).toEqual(
      await templatedAsAdminResult(ecoName, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsAdminResult(ecoName, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.globalAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.spaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subsubspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subsubspaceMember.email)
    );
  });

  test('HA create space update - GA(1), HA (1), HM(6) get notifications', async () => {
    // Act
    await sendMessageToRoom(
      baseScenario.space.communication.updatesId,
      'EA space update ',
      TestUser.SPACE_ADMIN
    );

    // Assert
    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(9);

    expect(mails[0]).toEqual(
      await templatedAsAdminResult(ecoName, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsAdminResult(ecoName, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.globalAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.spaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subsubspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(ecoName, users.subsubspaceMember.email)
    );
  });

  test('CA create subspace update - GA(1), HA (1), CA(1), CM(3),  get notifications', async () => {
    // Act
    await sendMessageToRoom(
      baseScenario.subspace.communication.updatesId,
      'CA subspace update ',
      TestUser.SUBSPACE_ADMIN
    );

    // Assert
    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(7);

    expect(mails[0]).toEqual(
      await templatedAsAdminResult(subspaceName, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsAdminResult(subspaceName, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(subspaceName, users.globalAdmin.email)
    );
    expect(mails[0]).not.toEqual(
      await templatedAsMemberResult(subspaceName, users.spaceAdmin.email)
    );
    expect(mails[0]).not.toEqual(
      await templatedAsMemberResult(subspaceName, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(subspaceName, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(subspaceName, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(subspaceName, users.subsubspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(subspaceName, users.subsubspaceMember.email)
    );
  });

  test('OA create subsubspace update - GA(1), HA(1), CA(1), OA(1), OM(1), get notifications', async () => {
    // Act
    await sendMessageToRoom(
      baseScenario.subsubspace.communication.updatesId,
      'OA subsubspace update ',
      TestUser.SUBSUBSPACE_ADMIN
    );

    // Assert
    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(5);

    expect(mails[0]).toEqual(
      await templatedAsAdminResult(subsubspaceName, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsAdminResult(subsubspaceName, users.spaceAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(subsubspaceName, users.globalAdmin.email)
    );
    expect(mails[0]).not.toEqual(
      await templatedAsMemberResult(subsubspaceName, users.spaceAdmin.email)
    );
    expect(mails[0]).not.toEqual(
      await templatedAsMemberResult(subsubspaceName, users.spaceMember.email)
    );

    expect(mails[0]).not.toEqual(
      await templatedAsMemberResult(subsubspaceName, users.subspaceAdmin.email)
    );
    expect(mails[0]).not.toEqual(
      await templatedAsMemberResult(subsubspaceName, users.subspaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templatedAsMemberResult(
        subsubspaceName,
        users.subsubspaceAdmin.email
      )
    );
    expect(mails[0]).toEqual(
      await templatedAsMemberResult(
        subsubspaceName,
        users.subsubspaceMember.email
      )
    );
  });

  test('OA create subsubspace update - 0 notifications - all roles with notifications disabled', async () => {
    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );
    // Act
    await sendMessageToRoom(
      baseScenario.subsubspace.communication.updatesId,
      'OA subsubspace update 2',
      TestUser.SUBSUBSPACE_ADMIN
    );

    // Assert
    await delay(1500);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(0);
  });
});
