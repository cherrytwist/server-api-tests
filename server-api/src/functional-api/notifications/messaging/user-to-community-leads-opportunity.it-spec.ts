/* eslint-disable prettier/prettier */
import { deleteMailSlurperMails } from '../../../utils/mailslurper.rest.requests';
import { delay } from '../../../../../lib/src/utils/delay';
import { TestUser } from '@alkemio/tests-lib';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { users } from '../../../utils/queries/users-data';

import { sendMessageToCommunityLeads } from '@functional-api/communications/communication.params';
import { getMailsData } from '../../../types/entities-helper';
import {
  removeRoleFromUser,
  assignRoleToUser,
  assignRoleToOrganization,
  removeRoleFromOrganization,
} from '@functional-api/roleset/roles-request.params';
import {
  deleteOrganization,
  updateOrganization,
} from '@functional-api/contributor-management/organization/organization.request.params';
import { CommunityRoleType, SpacePrivacyMode } from '@generated/graphql';
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';

const senders = (communityName: string) => {
  return `You have sent a message to ${communityName} community`;
};

const receivers = (senderDisplayName: string) => {
  return `${senderDisplayName} sent a message to your community`;
};

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await OrganizationWithSpaceModelFactory.createOrganizationWithSpaceAndUsers();

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.space.id,
    'notification-orgMention-subspace',
    baseScenario.subspace
  );

  await OrganizationWithSpaceModelFactory.createSubspaceWithUsers(
    baseScenario.subspace.id,
    'notification-orgMention-subsubspace',
    baseScenario.subsubspace
  );

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
    users.globalAdmin.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    users.subsubspaceMember.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    users.subsubspaceAdmin.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );

  await assignUserAsOrganizationAdmin(
    users.spaceAdmin.id,
    baseScenario.organization.id
  );

  await assignRoleToOrganization(
    baseScenario.organization.id,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});
describe('Notifications - send messages to Private Space, Subsubspace Community Leads', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test.only('NOT space member sends message to Subsubspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
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
          subject: receivers(users.nonSpaceMember.displayName),
          toAddresses: [users.subsubspaceMember.email],
        }),
        expect.objectContaining({
          subject: receivers(users.nonSpaceMember.displayName),
          toAddresses: [users.subsubspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: senders(baseScenario.subsubspace.profile.displayName),
          toAddresses: [users.nonSpaceMember.email],
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
          subject: receivers(users.subsubspaceMember.displayName),
          toAddresses: [users.subsubspaceMember.email],
        }),
        expect.objectContaining({
          subject: receivers(users.subsubspaceMember.displayName),
          toAddresses: [users.subsubspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: senders(baseScenario.subsubspace.profile.displayName),
          toAddresses: [users.subsubspaceMember.email],
        }),
      ])
    );
  });
});

describe('Notifications - send messages to Private Space, Public Subspace, Subsubspace with NO Community Leads', () => {
  beforeAll(async () => {
    await removeRoleFromUser(
      users.subsubspaceMember.id,
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      users.subsubspaceAdmin.id,
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
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });
});
