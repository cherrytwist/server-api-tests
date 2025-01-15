/* eslint-disable prettier/prettier */
import { delay, TestUser } from '@alkemio/tests-lib';
import { updateSpaceSettings } from '@functional-api/journey/space/space.request.params';
import { TestUserManager } from '@src/scenario/TestUserManager';
import { sendMessageToCommunityLeads } from '@functional-api/communications/communication.params';
import {
  removeRoleFromUser,
  assignRoleToUser,
  assignRoleToOrganization,
  removeRoleFromOrganization,
} from '@functional-api/roleset/roles-request.params';
import { updateOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { CommunityRoleType, SpacePrivacyMode } from '@generated/graphql';
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
import {
  deleteMailSlurperMails,
  getMailsData,
} from '@utils/mailslurper.rest.requests';

const senders = (communityName: string) => {
  return `You have sent a message to ${communityName} community`;
};

const receivers = (senderDisplayName: string) => {
  return `${senderDisplayName} sent a message to your community`;
};

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'messaging-user-to-community-leads-subsubspace',
  space: {
    collaboration: {
      addCallouts: false,
    },
    community: {
      addAdmin: true,
      addMembers: true,
    },
    subspace: {
      collaboration: {
        addCallouts: false,
      },
      community: {
        addAdmin: true,
        addMembers: true,
      },
      subspace: {
        collaboration: {
          addCallouts: false,
        },
        community: {
          addAdmin: true,
          addMembers: true,
        },
      },
    },
  },
};

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario = await TestScenarioFactory.createBaseScenario(scenarioConfig);

  await updateSpaceSettings(baseScenario.space.id, {
    privacy: {
      mode: SpacePrivacyMode.Private,
    },
  });

  await updateOrganization(baseScenario.organization.id, {
    legalEntityName: 'legalEntityName',
    domain: 'domain',
    website: 'https://website.org',
    contactEmail: 'test-org@alkem.io',
  });

  await removeRoleFromUser(
    TestUserManager.users.globalAdmin.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    TestUserManager.users.subsubspaceMember.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    TestUserManager.users.subsubspaceAdmin.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignUserAsOrganizationAdmin(
    TestUserManager.users.spaceAdmin.id,
    baseScenario.organization.id
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Notifications - send messages to Private Space, Subsubspace Community Leads', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('NOT space member sends message to Subsubspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      baseScenario.subsubspace.community.id,
      'Test message',
      TestUser.NON_SPACE_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers(TestUserManager.users.nonSpaceMember.displayName),
          toAddresses: [TestUserManager.users.subsubspaceMember.email],
        }),
        expect.objectContaining({
          subject: receivers(TestUserManager.users.nonSpaceMember.displayName),
          toAddresses: [TestUserManager.users.subsubspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: senders(baseScenario.subsubspace.profile.displayName),
          toAddresses: [TestUserManager.users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test('Subsubspace member send message to Subsubspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      baseScenario.subsubspace.community.id,
      'Test message',
      TestUser.SUBSUBSPACE_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers(
            TestUserManager.users.subsubspaceMember.displayName
          ),
          toAddresses: [TestUserManager.users.subsubspaceMember.email],
        }),
        expect.objectContaining({
          subject: receivers(
            TestUserManager.users.subsubspaceMember.displayName
          ),
          toAddresses: [TestUserManager.users.subsubspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: senders(baseScenario.subsubspace.profile.displayName),
          toAddresses: [TestUserManager.users.subsubspaceMember.email],
        }),
      ])
    );
  });
});

describe('Notifications - send messages to Private Space, Public Subspace, Subsubspace with NO Community Leads', () => {
  beforeAll(async () => {
    await removeRoleFromUser(
      TestUserManager.users.subsubspaceMember.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      TestUserManager.users.subsubspaceAdmin.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromOrganization(
      baseScenario.organization.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('NOT space member sends message to Subspace community (0 User Leads, 0 Org Lead) - 1 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      baseScenario.subsubspace.community.id,
      'Test message',
      TestUser.NON_SPACE_MEMBER
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(1);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: senders(baseScenario.subsubspace.profile.displayName),
          toAddresses: [TestUserManager.users.nonSpaceMember.email],
        }),
      ])
    );
  });
});
