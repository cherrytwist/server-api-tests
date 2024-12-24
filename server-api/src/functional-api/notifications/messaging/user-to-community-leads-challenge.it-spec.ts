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
import { assignUserAsOrganizationAdmin } from '@functional-api/contributor-management/organization/organization-authorization-mutation';
import { CommunityRoleType, SpacePrivacyMode } from '@generated/graphql';
import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();

const organizationName = 'urole-org-name' + uniqueId;
const hostNameId = 'urole-org-nameid' + uniqueId;
const spaceName = '111' + uniqueId;
const spaceNameId = '111' + uniqueId;
const subspaceName = `chName${uniqueId}`;

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

  await updateOrganization(entitiesId.organization.id, {
    legalEntityName: 'legalEntityName',
    domain: 'domain',
    website: 'https://website.org',
    contactEmail: 'test-org@alkem.io',
  });

  await updateSpaceSettings(entitiesId.spaceId, {
    privacy: {
      mode: SpacePrivacyMode.Private,
    },
  });

  await createSubspaceWithUsers(subspaceName);

  await removeRoleFromUser(
    users.globalAdmin.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    users.subspaceMember.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignRoleToUser(
    users.subspaceAdmin.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Lead
  );

  await assignUserAsOrganizationAdmin(
    users.spaceAdmin.id,
    entitiesId.organization.id
  );

  await assignRoleToOrganization(
    entitiesId.organization.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Lead
  );
});

afterAll(async () => {
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});
describe('Notifications - send messages to Private Space, Public Subspace Community Leads', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  // ToDo: fix test
  test.skip('NOT space member sends message to Subspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subspace.communityId,
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
          toAddresses: [users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: receivers(users.nonSpaceMember.displayName),
          toAddresses: [users.subspaceMember.email],
        }),
        expect.objectContaining({
          subject: senders(subspaceName),
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test('Space member send message to Subspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subspace.communityId,
      'Test message',
      TestUser.SPACE_ADMIN
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers(users.spaceAdmin.displayName),
          toAddresses: [users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: receivers(users.spaceAdmin.displayName),
          toAddresses: [users.subspaceMember.email],
        }),
        expect.objectContaining({
          subject: senders(subspaceName),
          toAddresses: [users.spaceAdmin.email],
        }),
      ])
    );
  });
});

describe('Notifications - send messages to Private Space, Private Subspace Community Leads', () => {
  beforeAll(async () => {
    await updateSpaceSettings(entitiesId.subspace.id, {
      privacy: {
        mode: SpacePrivacyMode.Private,
      },
    });
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('NOT space member sends message to Subspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subspace.communityId,
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
          toAddresses: [users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: receivers(users.nonSpaceMember.displayName),
          toAddresses: [users.subspaceMember.email],
        }),
        expect.objectContaining({
          subject: senders(subspaceName),
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });

  test('Subspace member send message to Subspace community (2 User Leads, 1 Org Lead) - 3 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subspace.communityId,
      'Test message',
      TestUser.SPACE_ADMIN
    );
    await delay(3000);

    const getEmailsData = await getMailsData();

    // Assert
    expect(getEmailsData[1]).toEqual(3);
    expect(getEmailsData[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: receivers(users.spaceAdmin.displayName),
          toAddresses: [users.subspaceAdmin.email],
        }),
        expect.objectContaining({
          subject: receivers(users.spaceAdmin.displayName),
          toAddresses: [users.subspaceMember.email],
        }),
        expect.objectContaining({
          subject: senders(subspaceName),
          toAddresses: [users.spaceAdmin.email],
        }),
      ])
    );
  });
});

describe('Notifications - send messages to Private Space, Public Subspace NO Community Leads', () => {
  beforeAll(async () => {
    await updateSpaceSettings(entitiesId.subspace.id, {
      privacy: {
        mode: SpacePrivacyMode.Public,
      },
    });

    await removeRoleFromUser(
      users.subspaceAdmin.id,
      entitiesId.subspace.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromUser(
      users.subspaceMember.id,
      entitiesId.subspace.roleSetId,
      CommunityRoleType.Lead
    );

    await removeRoleFromOrganization(
      entitiesId.organization.id,
      entitiesId.subspace.roleSetId,
      CommunityRoleType.Lead
    );
  });

  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  test('NOT space member sends message to Subspace community (0 User Leads, 0 Org Lead) - 1 messages sent', async () => {
    // Act
    await sendMessageToCommunityLeads(
      entitiesId.subspace.communityId,
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
          subject: senders(subspaceName),
          toAddresses: [users.nonSpaceMember.email],
        }),
      ])
    );
  });
});
