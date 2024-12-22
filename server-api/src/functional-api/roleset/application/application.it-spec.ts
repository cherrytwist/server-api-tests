import '@utils/array.matcher';
import {
  createApplication,
  deleteApplication,
  getRoleSetInvitationsApplications,
  meQuery,
} from './application.request.params';
import {
  deleteSpace,
  updateSpaceSettings,
} from '../../journey/space/space.request.params';
import { registerInAlkemioOrFail, TestUser } from '@utils';
import { users } from '@utils/queries/users-data';
import {
  createChallengeForOrgSpace,
  createOrgAndSpace,
} from '@utils/data-setup/entities';

import {
  CommunityMembershipPolicy,
  CommunityRoleType,
  SpacePrivacyMode,
} from '@generated/alkemio-schema';
import { deleteUser } from '../../contributor-management/user/user.request.params';
import {
  assignRoleToUser,
  removeRoleFromUser,
} from '@functional-api/roleset/roles-request.params';
import { entitiesId } from '../../../types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { eventOnRoleSetApplication } from '../roleset-events.request.params';
import { uniqueId } from '@utils/uniqueId';

let applicationId: string;
let challengeApplicationId = '';
let applicationData: any;
const challengeName = `testChallenge ${uniqueId}`;
let roleSetPendingMemberships: any;
const isMember = '';
const organizationName = 'appl-org-name' + uniqueId;
const hostNameId = 'appl-org-nameid' + uniqueId;
const spaceName = 'appl-eco-name' + uniqueId;
const spaceNameId = 'appl-eco-nameid' + uniqueId;

beforeAll(async () => {
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);

  await createChallengeForOrgSpace(challengeName);
  await updateSpaceSettings(entitiesId.spaceId, {
    privacy: {
      mode: SpacePrivacyMode.Public,
    },
    membership: {
      policy: CommunityMembershipPolicy.Applications,
    },
  });
});

afterAll(async () => {
  await deleteSpace(entitiesId.challenge.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Application', () => {
  afterEach(async () => {
    await removeRoleFromUser(
      users.nonSpaceMember.id,
      entitiesId.space.roleSetId,
      CommunityRoleType.Member
    );

    if (applicationId && applicationId.length === 36) {
      await deleteApplication(applicationId);
      applicationId = '';
    }
  });

  test('should create application', async () => {
    // Act
    applicationData = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    applicationId = applicationData?.data?.applyForEntryRoleOnRoleSet?.id;
    const userAppsData = await meQuery(TestUser.GLOBAL_COMMUNITY_ADMIN);

    const getApp = userAppsData?.data?.me?.communityApplications;

    // Assert
    expect(applicationData.status).toBe(200);
    expect(applicationData?.data?.applyForEntryRoleOnRoleSet?.state).toEqual(
      'new'
    );
    expect(getApp).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          application: expect.objectContaining({
            id: applicationId,
            state: 'new',
          }),
          spacePendingMembershipInfo: { id: entitiesId.spaceId },
        }),
      ])
    );
    expect(getApp).toHaveLength(1);
  });

  test('should create space application, when previous was REJECTED and ARCHIVED', async () => {
    // Arrange
    applicationData = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    applicationId = applicationData?.data?.applyForEntryRoleOnRoleSet?.id;

    // Reject and Archive Space application
    await eventOnRoleSetApplication(applicationId, 'REJECT');
    await eventOnRoleSetApplication(applicationId, 'ARCHIVE');

    // Act
    // Creates application second time
    applicationData = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    applicationId = applicationData?.data?.applyForEntryRoleOnRoleSet?.id;

    const userAppsData = await meQuery(TestUser.GLOBAL_COMMUNITY_ADMIN);
    const getApp = userAppsData?.data?.me?.communityApplications;

    // Assert
    expect(applicationData.status).toBe(200);
    expect(applicationData?.data?.applyForEntryRoleOnRoleSet?.state).toEqual(
      'new'
    );
    expect(getApp).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          application: expect.objectContaining({
            id: applicationId,
            state: 'new',
          }),
          spacePendingMembershipInfo: { id: entitiesId.spaceId },
        }),
      ])
    );
    const getAppFiltered =
      getApp?.filter(app => app.application.state !== 'archived') ?? [];
    expect(getAppFiltered).toHaveLength(1);
  });

  test('should throw error for creating the same application twice', async () => {
    // Act
    const applicationDataOne = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    applicationId =
      applicationDataOne?.data?.applyForEntryRoleOnRoleSet?.id ?? 'undefined';
    const applicationDataTwo = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );

    // Assert
    expect(applicationDataTwo.error?.errors[0].message).toContain(
      `Application not possible: An open application (ID: ${applicationId}) already exists for contributor ${users.globalCommunityAdmin.id} on RoleSet: ${entitiesId.space.roleSetId}.`
    );
  });

  test('should remove application', async () => {
    // Arrange
    const applicationsBeforeCreateDelete = await getRoleSetInvitationsApplications(
      entitiesId.space.roleSetId
    );
    const countAppBeforeCreateDelete =
      applicationsBeforeCreateDelete?.data?.lookup?.roleSet?.applications
        .length;

    applicationData = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.QA_USER
    );
    applicationId = applicationData?.data?.applyForEntryRoleOnRoleSet?.id;

    // Act
    await deleteApplication(applicationId);
    const userAppsData = await meQuery(TestUser.QA_USER);
    const getApp = userAppsData?.data?.me?.communityApplications;
    const applicationsAfterCreateDelete = await getRoleSetInvitationsApplications(
      entitiesId.space.roleSetId
    );
    const countAppAfterCreateDelete =
      applicationsAfterCreateDelete?.data?.lookup?.roleSet?.applications.length;

    // Assert
    //expect(applicationData.status).toBe(200);
    expect(countAppAfterCreateDelete).toEqual(countAppBeforeCreateDelete);
    expect(getApp).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: applicationId,
        }),
      ])
    );
    expect(getApp).toHaveLength(0);
    // Unset the application Id so that afterEach does not try to delete it again
    applicationId = '';
  });

  // Bug - user challenge application can be approved, when he/she is not member of the parent community
  // https://app.zenspace.com/workspaces/alkemio-5ecb98b262ebd9f4aec4194c/issues/alkem-io/client-web/1148
  test.skip('should throw error for APPROVING challenge application, when user is not space member', async () => {
    // Arrange
    // Create challenge application
    applicationData = await createApplication(entitiesId.challenge.roleSetId);
    const createAppData = applicationData?.data?.applyForEntryRoleOnRoleSet;
    challengeApplicationId = createAppData?.id;

    // Act
    // Approve challenge application
    const event = await eventOnRoleSetApplication(
      challengeApplicationId,
      'APPROVE'
    );

    // Assert
    expect(event.status).toBe(200);
    expect(event.error?.errors[0].message).toContain('Error');
  });

  test('User should not be able to approve own application', async () => {
    // Act
    applicationData = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.QA_USER
    );
    const createAppData = applicationData?.data?.applyForEntryRoleOnRoleSet;
    const applicationSpaceId = createAppData?.id;

    const eventResponseData = await eventOnRoleSetApplication(
      applicationSpaceId,
      'APPROVE',
      TestUser.QA_USER
    );
    const userAppsData = await meQuery(TestUser.QA_USER);

    const applicationState =
      userAppsData?.data?.me?.communityApplications[0].application.state;

    // Assert
    expect(applicationState).toEqual('new');

    await deleteApplication(applicationSpaceId);
  });

  test('should return applications after user is removed', async () => {
    // Arrange
    const applicationsBeforeCreateDelete = await getRoleSetInvitationsApplications(
      entitiesId.space.roleSetId
    );
    const countAppBeforeCreateDelete =
      applicationsBeforeCreateDelete?.data?.lookup?.roleSet?.applications
        .length;

    applicationData = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.QA_USER
    );

    applicationId = applicationData?.data?.applyForEntryRoleOnRoleSet?.id;

    // Act
    await deleteUser(users.qaUser.id);
    await registerInAlkemioOrFail('qa', 'user', 'qa.user@alkem.io');

    const applicationsAfterCreateDelete = await getRoleSetInvitationsApplications(
      entitiesId.space.roleSetId
    );
    const countAppAfterCreateDelete =
      applicationsAfterCreateDelete?.data?.lookup?.roleSet?.applications.length;

    // Assert
    expect(countAppAfterCreateDelete).toEqual(countAppBeforeCreateDelete);
  });
});

describe('Application-flows', () => {
  beforeAll(async () => {
    await assignRoleToUser(
      users.globalCommunityAdmin.id,
      entitiesId.space.roleSetId,
      CommunityRoleType.Member
    );
  });

  afterEach(async () => {
    await removeRoleFromUser(
      users.globalCommunityAdmin.id,
      entitiesId.challenge.roleSetId,
      CommunityRoleType.Member
    );
    if (challengeApplicationId.length === 36) {
      await deleteApplication(challengeApplicationId);
    }
    if (applicationId.length === 36) {
      await deleteApplication(applicationId);
    }
  });

  test('should create application on challenge', async () => {
    // Act
    await updateSpaceSettings(entitiesId.challenge.id, {
      membership: {
        policy: CommunityMembershipPolicy.Applications,
      },
    });

    applicationData = await createApplication(
      entitiesId.challenge.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );

    const createAppData = applicationData.data?.applyForEntryRoleOnRoleSet;
    challengeApplicationId = createAppData?.id;

    // Assert
    expect(applicationData.status).toBe(200);
    expect(createAppData.state).toEqual('new');
  });

  test('should return correct membershipUser applications', async () => {
    // Act
    // Create challenge application
    applicationData = await createApplication(
      entitiesId.challenge.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    const createAppData = applicationData?.data?.applyForEntryRoleOnRoleSet;
    challengeApplicationId = createAppData?.id;

    const userAppsData = await meQuery(TestUser.GLOBAL_COMMUNITY_ADMIN);

    const membershipData = userAppsData?.data?.me?.communityApplications;
    const challengeAppOb = [
      expect.objectContaining({
        application: expect.objectContaining({
          id: challengeApplicationId,
          state: 'new',
          isFinalized: false,
          nextEvents: ['APPROVE', 'REJECT'],
        }),
        spacePendingMembershipInfo: expect.objectContaining({
          id: entitiesId.challenge.id,
        }),
      }),
    ];

    const filteredMembershipData =
      membershipData?.filter(app => app.application.state == 'new') ?? [];

    // Assert
    expect(filteredMembershipData).toEqual(
      expect.arrayContaining(challengeAppOb)
    );
  });

  test('should return updated membershipUser applications', async () => {
    // Act
    // Create challenge application
    applicationData = await createApplication(
      entitiesId.challenge.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    const createAppData = applicationData?.data?.applyForEntryRoleOnRoleSet;
    challengeApplicationId = createAppData?.id;

    // Remove challenge application
    await deleteApplication(challengeApplicationId);

    // Update space application state
    await eventOnRoleSetApplication(applicationId, 'REJECT');

    const userAppsDataAfter = await meQuery(TestUser.GLOBAL_COMMUNITY_ADMIN);
    const membershipDataAfter =
      userAppsDataAfter?.data?.me?.communityApplications;

    const challengeAppOb = [
      {
        application: {
          id: challengeApplicationId,
          state: 'new',
        },
        spacePendingMembershipInfo: { id: entitiesId.challenge.id },
      },
    ];

    // Assert
    expect(membershipDataAfter).not.toContain(challengeAppOb);

    // Unset the challengeApplicationId so that afterEach does not try to delete it again
    challengeApplicationId = '';
  });

  test('should approve subspace application, when space application is APPROVED and applications are allowed', async () => {
    // Arrange
    // Create + approve space application
    const spaceApplicationData = await createApplication(
      entitiesId.space.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );

    if (spaceApplicationData?.data?.applyForEntryRoleOnRoleSet) {
      applicationId =
        spaceApplicationData?.data?.applyForEntryRoleOnRoleSet?.id;
      await eventOnRoleSetApplication(applicationId, 'APPROVE');
    }

    await updateSpaceSettings(entitiesId.challenge.id, {
      privacy: {
        mode: SpacePrivacyMode.Public,
      },
      membership: {
        policy: CommunityMembershipPolicy.Applications,
      },
    });

    // Create challenge application
    const subspaceApplicationData = await createApplication(
      entitiesId.challenge.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );

    challengeApplicationId = 'NotRetrieved';
    if (subspaceApplicationData?.data?.applyForEntryRoleOnRoleSet) {
      challengeApplicationId =
        subspaceApplicationData?.data?.applyForEntryRoleOnRoleSet?.id;
    }
    expect(challengeApplicationId.length).toEqual(36);
    if (challengeApplicationId.length !== 36) {
      throw new Error('Challenge application failed to create');
    }

    // Act
    // Approve challenge application
    const challengeApplicationEventResponse = await eventOnRoleSetApplication(
      challengeApplicationId,
      'APPROVE'
    );

    const challengeApplication =
      challengeApplicationEventResponse?.data?.eventOnApplication;

    // Assert
    expect(challengeApplicationEventResponse.status).toBe(200);
    expect(challengeApplication?.state).toContain('approved');
    expect(isMember).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: users.globalCommunityAdmin.id,
        }),
      ])
    );
  });

  test('should be able to remove challenge application, when space application is removed', async () => {
    // Create challenge application
    applicationData = await createApplication(
      entitiesId.challenge.roleSetId,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    const createAppData = applicationData?.data?.applyForEntryRoleOnRoleSet;
    challengeApplicationId = createAppData?.id;

    // Remove Space application
    if (applicationId && applicationId.length === 36) {
      await deleteApplication(applicationId);
    }
    // Act
    // Remove challenge application
    await deleteApplication(challengeApplicationId);
    roleSetPendingMemberships = await getRoleSetInvitationsApplications(
      entitiesId.challenge.roleSetId
    );
    const applications =
      roleSetPendingMemberships?.data?.lookup.roleSet.applications;

    // Assert
    expect(applications).toHaveLength(0);
    expect(isMember).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: users.globalCommunityAdmin.id,
        }),
      ])
    );

    // Unset the challengeApplicationId so that afterEach does not try to delete it again
    applicationId = '';
    challengeApplicationId = '';
  });
});
