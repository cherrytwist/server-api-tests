import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import {
  createApplication,
  deleteApplication,
} from '@functional-api/roleset/application/application.request.params';
import { delay } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import {
  CommunityMembershipPolicy,
  CommunityRoleType,
} from '@generated/alkemio-schema';
import { getMailsData } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { PreferenceType } from '@generated/graphql';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';

let preferencesConfig: any[] = [];

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await OrganizationWithSpaceModelFactory.createOrganizationWithSpaceAndUsers();

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.space.id,
    'notification-application-subspace',
    baseScenario.subspace
  );

  await updateSpaceSettings(baseScenario.space.id, {
    membership: { policy: CommunityMembershipPolicy.Applications },
  });

  preferencesConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationApplicationSubmitted,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationApplicationReceived,
    },
  ];
});

afterAll(async () => {
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

describe('Notifications - applications', () => {
  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationApplicationSubmitted,
      'false'
    );
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationApplicationReceived,
      'false'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationApplicationSubmitted,
      'false'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
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
    const applicatioData = await createApplication(baseScenario.space.community.roleSetId);

    baseScenario.space.community.applicationId =
      applicatioData?.data?.applyForEntryRoleOnRoleSet?.id ?? '';

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `${baseScenario.space.profile.displayName}: Application from non`,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.space.profile.displayName}: Application from non`,
          toAddresses: [users.spaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.space.profile.displayName} - Your Application to join was received!`,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test('receive notification for non space user application to subspace- GA, EA, CA and Applicant', async () => {
    // Arrange
    await assignRoleToUser(
      users.nonSpaceMember.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member
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
          subject: `${baseScenario.subspace.profile.displayName}: Application from non`,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.subspace.profile.displayName}: Application from non`,
          toAddresses: [users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.subspace.profile.displayName} - Your Application to join was received!`,
          toAddresses: [users.nonSpaceMember.email],
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
