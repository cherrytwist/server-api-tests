import { uniqueId } from '@utils/uniqueId';
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
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';

import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { entitiesId, getMailsData } from '@src/types/entities-helper';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';

const organizationName = 'not-app-org-name' + uniqueId;
const hostNameId = 'not-app-org-nameid' + uniqueId;
const spaceName = 'not-app-eco-name' + uniqueId;
const spaceNameId = 'not-app-eco-nameid' + uniqueId;
const subsubspaceName = 'subsubspace-name';
const subspaceName = 'challlenge-name';
const ecoName = spaceName;

let invitationId = '';
let preferencesConfig: any[] = [];

beforeAll(async () => {
  await deleteMailSlurperMails();

  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );

  await updateSpaceSettings(entitiesId.spaceId, {
    membership: {
      allowSubspaceAdminsToInviteMembers: true,
    },
  });

  await createSubspaceWithUsers(subspaceName);

  await updateSpaceSettings(entitiesId.subspace.id, {
    membership: {
      allowSubspaceAdminsToInviteMembers: true,
    },
  });

  await createSubsubspaceWithUsers(subsubspaceName);

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
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Notifications - invitations', () => {
  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationCommunityInvitationUser,
      'false'
    );

    await changePreferenceUser(
      users.globalCommunityAdmin.id,
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
      entitiesId.space.roleSetId,
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
          subject: `Invitation to join ${ecoName}`,
          toAddresses: [emailExternalUser],
        }),
      ])
    );
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${ecoName}`,
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
      entitiesId.subspace.roleSetId,
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
          subject: `Invitation to join ${subspaceName}`,
          toAddresses: [emailExternalUser],
        }),
      ])
    );
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${subspaceName}`,
          toAddresses: [users.subspaceAdmin.email],
        }),
      ])
    );
  });
});
