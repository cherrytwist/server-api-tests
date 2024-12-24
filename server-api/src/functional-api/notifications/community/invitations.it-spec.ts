import { uniqueId } from '@utils/uniqueId';
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { delay } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import {
  deleteInvitation,
  inviteContributors,
} from '@functional-api/roleset/invitations/invitation.request.params';
import { TestUser } from '@alkemio/tests-lib';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { entitiesId, getMailsData } from '@src/types/entities-helper';
import { PreferenceType } from '@generated/graphql';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';

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
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
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
      users.globalSupportAdmin.id,
      PreferenceType.NotificationCommunityInvitationUser,
      'false'
    );
    await changePreferenceUser(
      users.globalAdmin.id,
      PreferenceType.NotificationCommunityInvitationUser,
      'false'
    );
    for (const config of preferencesConfig)
      await changePreferenceUser(config.userID, config.type, 'true');
  });

  afterEach(async () => {
    await deleteInvitation(invitationId);
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('non space user receive invitation for SPACE community from space admin', async () => {
    // Act
    const invitationData = await inviteContributors(
      entitiesId.space.roleSetId,
      [users.nonSpaceMember.id],
      TestUser.SPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${ecoName}`,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test('non space user receive invitation for SPACE community from subspace admin', async () => {
    // Act
    const invitationData = await inviteContributors(
      entitiesId.space.roleSetId,
      [users.qaUser.id],
      TestUser.SUBSPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${ecoName}`,
          toAddresses: [users.qaUser.email],
        }),
      ])
    );
  });

  test('non space user receive invitation for CHALLENGE community from subspace admin', async () => {
    // Act
    const invitationData = await inviteContributors(
      entitiesId.subspace.roleSetId,
      [users.qaUser.id],
      TestUser.SUBSPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${subspaceName}`,
          toAddresses: [users.qaUser.email],
        }),
      ])
    );
  });

  test("non space user don't receive invitation for CHALLENGE community from subsubspace admin", async () => {
    // Act
    const invitationData = await inviteContributors(
      entitiesId.subspace.roleSetId,
      [users.qaUser.id],
      TestUser.SUBSUBSPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(0);
    expect(invitationData.error?.errors[0].message).toEqual(
      `Contributor is not a member of the parent community (${entitiesId.space.roleSetId}) and the current user does not have the privilege to invite to the parent community`
    );
  });

  test('space member receive invitation for CHALLENGE community from subsubspace admin', async () => {
    // Act
    const invitationData = await inviteContributors(
      entitiesId.subspace.roleSetId,
      [users.spaceMember.id],
      TestUser.SUBSUBSPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${subspaceName}`,
          toAddresses: [users.spaceMember.email],
        }),
      ])
    );
  });

  test('non space user receive invitation for OPPORTUNITY community from subsubspace admin', async () => {
    // Act
    const invitationData = await inviteContributors(
      entitiesId.subsubspace.roleSetId,
      [users.qaUser.id],
      TestUser.SUBSUBSPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: `Invitation to join ${subsubspaceName}`,
          toAddresses: [users.qaUser.email],
        }),
      ])
    );
  });
  test("non space user doesn't receive invitation for SPACE community from space admin", async () => {
    // Arrange
    await changePreferenceUser(
      users.nonSpaceMember.id,
      PreferenceType.NotificationCommunityInvitationUser,
      'false'
    );

    // Act
    const invitationData = await inviteContributors(
      entitiesId.space.roleSetId,
      [users.nonSpaceMember.id],
      TestUser.SPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(0);
  });

  test("non space user doesn't receive invitation for CHALLENGE community from subspace admin, flag disabled", async () => {
    // Arrange
    await updateSpaceSettings(entitiesId.subspace.id, {
      membership: {
        allowSubspaceAdminsToInviteMembers: false,
      },
    });

    // Act
    const invitationData = await inviteContributors(
      entitiesId.subspace.roleSetId,
      [users.qaUser.displayName],
      TestUser.SUBSPACE_ADMIN
    );
    const invitationsInfo =
      invitationData?.data?.inviteContributorsForRoleSetMembership;
    invitationId = 'invitationsInfoNotRetrieved';
    if (invitationsInfo && invitationsInfo.length > 0) {
      invitationId = invitationsInfo[0].id;
    }

    await delay(6000);

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(0);
  });
});
