import { uniqueId } from '@utils/uniqueId';
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
import {
  createSubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';

import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import {
  CommunityMembershipPolicy,
  CommunityRoleType,
} from '@generated/alkemio-schema';
import { entitiesId, getMailsData } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { PreferenceType } from '@generated/graphql';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';

const organizationName = 'not-app-org-name' + uniqueId;
const hostNameId = 'not-app-org-nameid' + uniqueId;
const spaceName = 'not-app-eco-name' + uniqueId;
const spaceNameId = 'not-app-eco-nameid' + uniqueId;

const ecoName = spaceName;
const subspaceName = `chName${uniqueId}`;
let preferencesConfig: any[] = [];

beforeAll(async () => {
  await deleteMailSlurperMails();

  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createSubspaceWithUsers(subspaceName);
  await updateSpaceSettings(entitiesId.spaceId, {
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
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
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
    const applicatioData = await createApplication(entitiesId.space.roleSetId);

    entitiesId.space.applicationId =
      applicatioData?.data?.applyForEntryRoleOnRoleSet?.id ?? '';

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `${ecoName}: Application from non`,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: `${ecoName}: Application from non`,
          toAddresses: [users.spaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${ecoName} - Your Application to join was received!`,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test('receive notification for non space user application to subspace- GA, EA, CA and Applicant', async () => {
    // Arrange
    await assignRoleToUser(
      users.nonSpaceMember.id,
      entitiesId.space.roleSetId,
      CommunityRoleType.Member
    );

    await updateSpaceSettings(entitiesId.subspace.id, {
      membership: {
        policy: CommunityMembershipPolicy.Applications,
      },
    });

    // Act
    await createApplication(entitiesId.subspace.roleSetId);

    await delay(6000);
    const getEmailsData = await getMailsData();

    // Assert

    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `${subspaceName}: Application from non`,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: `${subspaceName}: Application from non`,
          toAddresses: [users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${subspaceName} - Your Application to join was received!`,
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

    await deleteApplication(entitiesId.space.applicationId);

    // Act
    await createApplication(entitiesId.subspace.roleSetId);

    await delay(1500);
    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(0);
  });
});
