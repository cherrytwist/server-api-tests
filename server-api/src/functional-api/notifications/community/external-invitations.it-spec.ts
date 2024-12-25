import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { delay } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import {
  deleteExternalInvitation,
  inviteExternalUser,
} from '@functional-api/roleset/invitations/invitation.request.params';
import { TestUser } from '@alkemio/tests-lib';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { getMailsData } from '@src/types/entities-helper';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';

const uniqueId = UniqueIDGenerator.getID();

let invitationId = '';
let preferencesConfig: any[] = [];

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await OrganizationWithSpaceModelFactory.createOrganizationWithSpaceAndUsers();

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.space.id,
    'notification-externalInvitation-subspace',
    baseScenario.subspace
  );

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.subspace.id,
    'notification-externalInvitation-subsubspace',
    baseScenario.subsubspace
  );

  await updateSpaceSettings(baseScenario.space.id, {
    membership: {
      allowSubspaceAdminsToInviteMembers: true,
    },
  });

  await updateSpaceSettings(baseScenario.subspace.id, {
    membership: {
      allowSubspaceAdminsToInviteMembers: true,
    },
  });

  preferencesConfig = [
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationCommunityInvitationUser,
    },

    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationCommunityInvitationUser,
    },

    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationCommunityInvitationUser,
    },

    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationCommunityInvitationUser,
    },

    {
      userID: users.qaUser.id,
      type: PreferenceType.NotificationCommunityInvitationUser,
    },
  ];
});

afterAll(async () => {
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

describe('Notifications - invitations', () => {
  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationCommunityInvitationUser,
      'false'
    );

    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationCommunityInvitationUser,
      'false'
    );
    for (const config of preferencesConfig)
      await changePreferenceUser(config.userID, config.type, 'true');
  });

  afterEach(async () => {
    await deleteExternalInvitation(invitationId);
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('sender and external user receive notifications', async () => {
    // Act
    const emailExternalUser = `external${uniqueId}@alkem.io`;
    const message = 'Hello, feel free to join our community!';

    const invitationData = await inviteExternalUser(
      baseScenario.space.community.roleSetId,
      emailExternalUser,
      message,
      TestUser.GLOBAL_ADMIN
    );

    const invitationInfo = invitationData?.data?.inviteUserToPlatformAndRoleSet;
    invitationId = invitationInfo?.id ?? '';

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(2);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${baseScenario.space.profile.displayName}`,
          toAddresses: [emailExternalUser],
        }),
      ])
    );
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${baseScenario.space.profile.displayName}`,
          toAddresses: [users.globalAdmin.email],
        }),
      ])
    );
  });

  test.only('subspace admin (sender) and external user receive notifications', async () => {
    // Act
    const emailExternalUser = `external${uniqueId}@alkem.io`;
    const message = 'Hello, feel free to join our community!';

    const invitationData = await inviteExternalUser(
      baseScenario.subspace.community.roleSetId,
      emailExternalUser,
      message,
      TestUser.SUBSPACE_ADMIN
    );

    const invitationInfo = invitationData?.data?.inviteUserToPlatformAndRoleSet;
    invitationId = invitationInfo?.id ?? '';

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(2);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${baseScenario.subspace.profile.displayName}`,
          toAddresses: [emailExternalUser],
        }),
      ])
    );
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${baseScenario.subspace.profile.displayName}`,
          toAddresses: [users.subspaceAdmin.email],
        }),
      ])
    );
  });
});
