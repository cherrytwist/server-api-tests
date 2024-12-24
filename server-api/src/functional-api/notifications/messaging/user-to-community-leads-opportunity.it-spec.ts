/* eslint-disable prettier/prettier */
import { deleteMailSlurperMails } from '../../../utils/mailslurper.rest.requests';
import { delay } from '../../../../../lib/src/utils/delay';
import { TestUser } from '@alkemio/tests-lib';
import {
  deleteSpace,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { users } from '../../../utils/queries/users-data';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '../../../utils/data-setup/entities';
import { sendMessageToCommunityLeads } from '@functional-api/communications/communication.params';
import {
  entitiesId,
  getMailsData,
} from '../../../types/entities-helper';
import {
  removeRoleFromUser,
  assignRoleToUser,
  assignRoleToOrganization,
  removeRoleFromOrganization,
} from '@functional-api/roleset/roles-request.params';

import { deleteOrganization, updateOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();
import { CommunityRoleType, SpacePrivacyMode } from '@generated/graphql';
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';

const organizationName = 'urole-org-name' + uniqueId;
const hostNameId = 'urole-org-nameid' + uniqueId;
const spaceName = '111' + uniqueId;
const spaceNameId = '111' + uniqueId;
const subspaceName = `chName${uniqueId}`;
const subsubspaceName = `oppName${uniqueId}`;

const senders = (communityName: string) => {
  return `You have sent a message to ${communityName} community`;
};

const receivers = (senderDisplayName: string) => {
  return `${senderDisplayName} sent a message to your community`;
};

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
  });

  await updateOrganization(entitiesId.organization.id, {
    legalEntityName: 'legalEntityName',
    domain: 'domain',
    website: 'https://website.org',
    contactEmail: 'test-org@alkem.io',
  });

  await createSubspaceWithUsers(subspaceName);
  await createSubsubspaceWithUsers(subsubspaceName);

  await removeRoleFromUser(
    users.globalAdmin.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    users.subsubspaceMember.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    users.subsubspaceAdmin.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignUserAsOrganizationAdmin(
    users.spaceAdmin.id,
    entitiesId.organization.id
  );

  await assignRoleToOrganization(
    entitiesId.organization.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});
describe('Notifications - send messages to Private Space, Subsubspace Community Leads', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test.only('NOT space member sends message to Subsubspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subsubspace.communityId,
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
          subject: senders(subsubspaceName),
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test('Subsubspace member send message to Subsubspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subsubspace.communityId,
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
          subject: senders(subsubspaceName),
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
      entitiesId.subsubspace.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      users.subsubspaceAdmin.id,
      entitiesId.subsubspace.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromOrganization(
      entitiesId.organization.id,
      entitiesId.subsubspace.roleSetId,
      CommunityRoleType.Lead
    );
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('NOT space member sends message to Subspace community (0 User Leads, 0 Org Lead) - 1 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subsubspace.communityId,
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
          subject: senders(subsubspaceName),
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });
});
