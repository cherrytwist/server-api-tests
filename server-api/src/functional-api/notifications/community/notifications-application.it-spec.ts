/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  deleteMailSlurperMails,
  getMailsData,
} from '@utils/mailslurper.rest.requests';
import { updateSpaceSettings } from '@functional-api/journey/space/space.request.params';
import {
  createApplication,
  deleteApplication,
} from '@functional-api/roleset/application/application.request.params';
import { delay, TestUser } from '@alkemio/tests-lib';
import { TestUserManager } from '@src/scenario/TestUserManager';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import { CommunityMembershipPolicy, RoleName } from '@generated/alkemio-schema';
import { PreferenceType } from '@generated/graphql';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
import { getUserData } from '@functional-api/contributor-management/user/user.request.params';

let preferencesConfig: any[] = [];

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'notifications-application',
  space: {
    collaboration: {
      addPostCallout: true,
      addPostCollectionCallout: true,
      addWhiteboardCallout: true,
    },
    community: {
      admins: [TestUser.SPACE_ADMIN],
      members: [
        TestUser.SPACE_MEMBER,
        TestUser.SPACE_ADMIN,
        TestUser.SUBSPACE_MEMBER,
        TestUser.SUBSPACE_ADMIN,
        TestUser.SUBSUBSPACE_MEMBER,
        TestUser.SUBSUBSPACE_ADMIN,
      ],
    },
    settings: {
      membership: {
        policy: CommunityMembershipPolicy.Applications,
      },
    },
    subspace: {
      collaboration: {
        addPostCallout: true,
        addPostCollectionCallout: true,
        addWhiteboardCallout: true,
      },
      community: {
        admins: [TestUser.SUBSPACE_ADMIN],
        members: [
          TestUser.SUBSPACE_MEMBER,
          TestUser.SUBSPACE_ADMIN,
          TestUser.SUBSUBSPACE_MEMBER,
          TestUser.SUBSUBSPACE_ADMIN,
        ],
      },
    },
  },
};

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario = await TestScenarioFactory.createBaseScenario(scenarioConfig);

  preferencesConfig = [
    {
      userID: TestUserManager.users.globalAdmin.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
    {
      userID: TestUserManager.users.nonSpaceMember.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: TestUserManager.users.spaceAdmin.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: TestUserManager.users.spaceAdmin.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
    {
      userID: TestUserManager.users.spaceMember.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: TestUserManager.users.spaceMember.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
    {
      userID: TestUserManager.users.subspaceAdmin.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: TestUserManager.users.subspaceAdmin.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
  ];
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Notifications - applications', () => {
  beforeAll(async () => {
    const notificationsUserId = await getUserData('notifications@alkem.io');
    const notificationsAdminUserId = notificationsUserId?.data?.user?.id ?? '';
    await changePreferenceUser(
      notificationsAdminUserId,
      PreferenceType.NotificationApplicationSubmitted,
      'false'
    );
    await changePreferenceUser(
      notificationsAdminUserId,
      PreferenceType.NotificationApplicationReceived,
      'false'
    );
    await changePreferenceUser(
      TestUserManager.users.globalSupportAdmin.id,
      PreferenceType.NotificationApplicationSubmitted,
      'false'
    );
    await changePreferenceUser(
      TestUserManager.users.globalSupportAdmin.id,
      PreferenceType.NotificationApplicationReceived,
      'false'
    );
    for (const config of preferencesConfig)
      await changePreferenceUser(config.userID, config.type, 'true');
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('receive notification for non space user application to space- GA, EA and Applicant', async () => {
    // Act
    const applicatioData = await createApplication(
      baseScenario.space.community.roleSetId
    );

    baseScenario.space.community.applicationId =
      applicatioData?.data?.applyForEntryRoleOnRoleSet?.id ?? '';

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `${baseScenario.space.about.profile.displayName}: Application from qa`,
          toAddresses: [TestUserManager.users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.space.about.profile.displayName}: Application from qa`,
          toAddresses: [TestUserManager.users.spaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.space.about.profile.displayName} - Your Application to join was received!`,
          toAddresses: [TestUserManager.users.qaUser.email],
        }),
      ])
    );
  });

  test('receive notification for non space user application to subspace- GA, EA, CA and Applicant', async () => {
    // Arrange
    await assignRoleToUser(
      TestUserManager.users.qaUser.id,
      baseScenario.space.community.roleSetId,
      RoleName.Member
    );

    await updateSpaceSettings(baseScenario.subspace.id, {
      membership: {
        policy: CommunityMembershipPolicy.Applications,
      },
    });

    // Act
    await createApplication(baseScenario.subspace.community.roleSetId);

    await delay(6000);
    const getEmailsData = await getMailsData();

    // Assert

    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `${baseScenario.subspace.about.profile.displayName}: Application from qa`,
          toAddresses: [TestUserManager.users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.subspace.about.profile.displayName}: Application from qa`,
          toAddresses: [TestUserManager.users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.subspace.about.profile.displayName} - Your Application to join was received!`,
          toAddresses: [TestUserManager.users.qaUser.email],
        }),
      ])
    );
    expect(getEmailsData[1]).toEqual(3);
  });

  test('no notification for non space user application to space- GA, EA and Applicant', async () => {
    // Arrange
    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );

    await deleteApplication(baseScenario.space.community.applicationId);

    // Act
    await createApplication(baseScenario.subspace.community.roleSetId);

    await delay(1500);
    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(0);
  });
});
