import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { delay } from '@alkemio/tests-lib';
import { TestUser } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import {
  createSubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import {
  joinRoleSet,
  assignRoleToUser,
  removeRoleFromUser,
} from '@functional-api/roleset/roles-request.params';
import {
  CommunityMembershipPolicy,
  SpacePrivacyMode,
} from '@generated/alkemio-schema';
import { entitiesId, getMailsData } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { CommunityRoleType, PreferenceType } from '@generated/graphql';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';

const organizationName = 'not-app-org-name' + uniqueId;
const hostNameId = 'not-app-org-nameid' + uniqueId;
const spaceName = 'not-app-eco-name' + uniqueId;
const spaceNameId = 'not-app-eco-nameid' + uniqueId;

const ecoName = spaceName;
const subspaceName = `chName${uniqueId}`;
let preferencesConfig: any[] = [];

const subjectAdminSpace = `user &#34;qa user&#34; joined ${ecoName}`;
const subjectAdminSpaceNon = `user &#34;non space&#34; joined ${ecoName}`;
const subjectAdminSubspace = `user &#34;non space&#34; joined ${subspaceName}`;

beforeAll(async () => {
  await deleteMailSlurperMails();

  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );

  await updateSpaceSettings(entitiesId.spaceId, {
    privacy: {
      mode: SpacePrivacyMode.Private,
    },
    membership: {
      policy: CommunityMembershipPolicy.Open,
    },
  });

  await createSubspaceWithUsers(subspaceName);
  await updateSpaceSettings(entitiesId.subspace.id, {
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
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
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
    await joinRoleSet(entitiesId.space.roleSetId, TestUser.NON_SPACE_MEMBER);
    await delay(10000);

    const getEmailsData = await getMailsData();
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
          subject: `${ecoName} - Welcome to the Community!`,
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  // skip until bug is resolved: https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/gh/alkem-io/notifications/333
  test('Non-space member join a Subspace - GA, HA, CA and Joiner receive notifications', async () => {
    // Act
    await joinRoleSet(entitiesId.subspace.roleSetId, TestUser.NON_SPACE_MEMBER);

    await delay(10000);
    const getEmailsData = await getMailsData();

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
          subject: `${subspaceName} - Welcome to the Community!`,
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
      entitiesId.space.roleSetId,
      CommunityRoleType.Member,
      TestUser.GLOBAL_ADMIN
    );

    await delay(10000);

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
          subject: `${ecoName} - Welcome to the Community!`,
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
      entitiesId.subspace.roleSetId,
      CommunityRoleType.Member
    );

    await removeRoleFromUser(
      users.nonSpaceMember.id,
      entitiesId.space.roleSetId,
      CommunityRoleType.Member
    );

    // Act
    await joinRoleSet(entitiesId.space.roleSetId, TestUser.QA_USER);

    await delay(3000);
    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(0);
  });
});
