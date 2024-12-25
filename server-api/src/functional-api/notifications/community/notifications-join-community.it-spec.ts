import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { delay } from '@alkemio/tests-lib';
import { TestUser } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';

import {
  joinRoleSet,
  assignRoleToUser,
  removeRoleFromUser,
} from '@functional-api/roleset/roles-request.params';
import {
  CommunityMembershipPolicy,
  SpacePrivacyMode,
} from '@generated/alkemio-schema';
import { getMailsData } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { CommunityRoleType, PreferenceType } from '@generated/graphql';
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
    'notification-joinCommunity-subspace',
    baseScenario.subspace
  );

  await updateSpaceSettings(baseScenario.space.id, {
    privacy: {
      mode: SpacePrivacyMode.Private,
    },
    membership: {
      policy: CommunityMembershipPolicy.Open,
    },
  });

  await updateSpaceSettings(baseScenario.subspace.id, {
    membership: {
      policy: CommunityMembershipPolicy.Open,
    },
  });

  preferencesConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationCommunityNewMemberAdmin,
    },
    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationCommunityNewMember,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationCommunityNewMemberAdmin,
    },
    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationCommunityNewMember,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationCommunityNewMemberAdmin,
    },
    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationCommunityNewMember,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationCommunityNewMember,
    },
    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationCommunityNewMemberAdmin,
    },
    {
      userID: users.qaUser.id,
      type: PreferenceType.NotificationCommunityNewMember,
    },
  ];
});

afterAll(async () => {
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

// Skip until clear the behavior
describe('Notifications - member join community', () => {
  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationCommunityNewMemberAdmin,
      'false'
    );
    for (const config of preferencesConfig) {
      await changePreferenceUser(config.userID, config.type, 'true');
    }
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });
  // skip until bug is resolved: https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/gh/alkem-io/notifications/333
  test('Non-space member join a Space - GA, HA and Joiner receive notifications', async () => {
    // Act
    await joinRoleSet(
      baseScenario.space.community.roleSetId,
      TestUser.NON_SPACE_MEMBER
    );
    await delay(10000);

    const getEmailsData = await getMailsData();
    const subjectAdminSpaceNon = `user &#34;non space&#34; joined ${baseScenario.space.profile.displayName}`;
    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: subjectAdminSpaceNon,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: subjectAdminSpaceNon,
          toAddresses: [users.spaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.space.profile.displayName} - Welcome to the Community!`,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  // skip until bug is resolved: https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/gh/alkem-io/notifications/333
  test('Non-space member join a Subspace - GA, HA, CA and Joiner receive notifications', async () => {
    // Act
    await joinRoleSet(
      baseScenario.subspace.community.roleSetId,
      TestUser.NON_SPACE_MEMBER
    );

    await delay(10000);
    const getEmailsData = await getMailsData();

    const subjectAdminSubspace = `user &#34;non space&#34; joined ${baseScenario.subspace.profile.displayName}`;

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: subjectAdminSubspace,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: subjectAdminSubspace,
          toAddresses: [users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.subspace.profile.displayName} - Welcome to the Community!`,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  // skip until bug is resolved: https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/gh/alkem-io/notifications/333
  test('Admin adds user to Space community - GA, HA and Joiner receive notifications', async () => {
    // Act
    await assignRoleToUser(
      users.qaUser.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member,
      TestUser.GLOBAL_ADMIN
    );

    await delay(10000);

    const subjectAdminSpace = `user &#34;qa user&#34; joined ${baseScenario.space.profile.displayName}`;

    const getEmailsData = await getMailsData();
    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: subjectAdminSpace,
          toAddresses: [users.globalAdmin.email],
        }),
        expect.objectContaining({
          subject: subjectAdminSpace,
          toAddresses: [users.spaceAdmin.email],
        }),
        expect.objectContaining({
          subject: `${baseScenario.space.profile.displayName} - Welcome to the Community!`,
          toAddresses: [users.qaUser.email],
        }),
      ])
    );
  });

  test('no notification when Non-space member cannot join a Space - GA, EA and Joiner', async () => {
    // Arrange
    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );

    await removeRoleFromUser(
      users.nonSpaceMember.id,
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Member
    );

    await removeRoleFromUser(
      users.nonSpaceMember.id,
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member
    );

    // Act
    await joinRoleSet(baseScenario.space.community.roleSetId, TestUser.QA_USER);

    await delay(3000);
    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(0);
  });
});
