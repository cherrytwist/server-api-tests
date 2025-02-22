import {
  createPostOnCallout,
  getDataPerOpportunityCallout,
} from '@functional-api/callout/post/post.request.params';
import { deleteChallenge } from '@functional-api/journey/challenge/challenge.request.params';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import {
  getOpportunityData,
  deleteSubspace,
} from '@functional-api/journey/opportunity/opportunity.request.params';
import { createRelation } from '@functional-api/relations/relations.request.params';
import { TestUser } from '@utils/test.user';
import { uniqueId } from '@utils/uniqueId';
import { users } from '@utils/queries/users-data';
import {
  sorted_sorted__create_read_update_delete_grant_createComment_Privilege,
  sorted__create_read_update_delete_grant_createDiscussion_Privilege,
  readPrivilege,
  sorted__read_createRelation,
  sorted__create_read_update_delete_grant_createMessage_messageReaction_messageReply,
  sorted__create_read_update_delete_grant_addMember_Invite,
} from '../../common';
import {
  assignUserAsGlobalCommunityAdmin,
  removeUserAsGlobalCommunityAdmin,
} from '@utils/mutations/authorization-mutation';
import {
  createChallengeForOrgSpace,
  createOpportunityForChallenge,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { CommunityRole } from '@alkemio/client-lib';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { entitiesId } from '@test/types/entities-helper';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';

const organizationName = 'auth-ga-org-name' + uniqueId;
const hostNameId = 'auth-ga-org-nameid' + uniqueId;
const spaceName = 'auth-ga-eco-name' + uniqueId;
const spaceNameId = 'auth-ga-eco-nameid' + uniqueId;
const opportunityName = 'auth-ga-opp';
const challengeName = 'auth-ga-chal';

beforeAll(async () => {
  await createOrgAndSpace(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createChallengeForOrgSpace(challengeName);
  await createOpportunityForChallenge(opportunityName);
  await assignRoleToUser(
    users.qaUser.id,
    entitiesId.space.communityId,
    RoleName.Member
  );

  await sendMessageToRoom(
    entitiesId.opportunity.updatesId,
    'test',
    TestUser.GLOBAL_ADMIN
  );

  await createRelation(
    entitiesId.opportunity.collaborationId,
    'incoming',
    'relationDescription',
    'relationActorName',
    'relationActorRole',
    'relationActorType',
    TestUser.GLOBAL_ADMIN
  );

  await createPostOnCallout(
    entitiesId.opportunity.calloutId,
    { displayName: 'postDisplayName' },
    'postnameid',
    TestUser.GLOBAL_ADMIN
  );
  await assignUserAsGlobalCommunityAdmin(users.spaceMember.id);
});
afterAll(async () => {
  await deleteSubspace(entitiesId.opportunity.id);
  await deleteSubspace(entitiesId.challenge.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
  await removeUserAsGlobalCommunityAdmin(users.spaceMember.id);
});

describe('myPrivileges', () => {
  test('GlobalCommunityAdmin privileges to Opportunity', async () => {
    // Act
    const response = await getOpportunityData(
      entitiesId.opportunity.id,
      TestUser.GLOBAL_COMMUNITY_ADMIN
    );
    const data =
      response.data?.lookup.opportunity?.authorization?.myPrivileges ?? [];

    // Assert
    expect(data.sort()).toEqual(readPrivilege);
  });

  describe('Community', () => {
    test('GlobalCommunityAdmin privileges to Opportunity / Community', async () => {
      // Act
      const response = await getOpportunityData(
        entitiesId.opportunity.id,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );
      const data =
        response.data?.lookup.opportunity?.community?.authorization
          ?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(
        sorted__create_read_update_delete_grant_addMember_Invite
      );
    });

    test('GlobalCommunityAdmin privileges to Opportunity / Community / Communication', async () => {
      // Act
      const response = await getOpportunityData(
        entitiesId.opportunity.id,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );
      const data =
        response.data?.lookup.opportunity?.community?.communication
          ?.authorization?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(
        sorted__create_read_update_delete_grant_createDiscussion_Privilege
      );
    });

    test.skip('GlobalCommunityAdmin privileges to Opportunity / Community / Communication / Discussion', async () => {
      // Act
      const response = await getOpportunityData(
        entitiesId.opportunity.id,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );

      const data =
        response.data?.lookup.opportunity?.community?.communication
          ?.discussions?.[0].authorization?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(
        sorted_sorted__create_read_update_delete_grant_createComment_Privilege
      );
    });

    test('GlobalCommunityAdmin privileges to Opportunity / Community / Communication / Updates', async () => {
      // Act
      const response = await getOpportunityData(
        entitiesId.opportunity.id,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );

      const data =
        response.data?.lookup.opportunity?.community?.communication?.updates
          .authorization?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(
        sorted__create_read_update_delete_grant_createMessage_messageReaction_messageReply
      );
    });
  });

  describe('Collaboration', () => {
    test('GlobalCommunityAdmin privileges to Opportunity / Collaboration', async () => {
      // Act
      const response = await getOpportunityData(
        entitiesId.opportunity.id,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );

      const data =
        response.data?.lookup.opportunity?.collaboration?.authorization
          ?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(sorted__read_createRelation);
    });

    test('GlobalCommunityAdmin privileges to Opportunity / Collaboration / Relations', async () => {
      // Act
      const response = await getOpportunityData(
        entitiesId.opportunity.id,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );

      const data =
        response.data?.lookup.opportunity?.collaboration?.relations?.[0]
          .authorization?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(readPrivilege);
    });

    test('GlobalCommunityAdmin privileges to Opportunity / Collaboration / Callout', async () => {
      // Act
      const response = await getOpportunityData(
        entitiesId.opportunity.id,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );
      const data =
        response.data?.lookup.opportunity?.collaboration?.callouts?.[0]
          .authorization?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(readPrivilege);
    });

    test('GlobalCommunityAdmin privileges to Opportunity / Collaboration / Callout / Post', async () => {
      // Act
      const response = await getDataPerOpportunityCallout(
        entitiesId.opportunity.id,
        entitiesId.opportunity.calloutId,
        TestUser.GLOBAL_COMMUNITY_ADMIN
      );

      const data =
        response.data?.lookup.opportunity?.collaboration?.callouts?.[0].contributions?.filter(
          c => c.post !== null
        )[0].post?.authorization?.myPrivileges ?? [];

      // Assert
      expect(data.sort()).toEqual(readPrivilege);
    });

    // ToDo
    test.skip('GlobalCommunityAdmin privileges to Opportunity / Collaboration / Callout / Whiteboard', async () => {
      // Act
      // const response = await getDataPerSpaceCallout(
      //   entitiesId.spaceId,
      //   entitiesId.space.calloutId,
      //   TestUser.GLOBAL_COMMUNITY_ADMIN
      // );
      // const data =
      //   response.data?.space.opportunity.collaboration.callouts[0].posts[0]
      //     .authorization.myPrivileges;
      // // Assert
      // expect(data.sort()).toEqual(readPrivilege);
    });

    // ToDo
    test.skip('GlobalCommunityAdmin privileges to Opportunity / Collaboration / Callout / Comments', async () => {
      // Act
      // const response = await getDataPerSpaceCallout(
      //   entitiesId.spaceId,
      //   entitiesId.space.calloutId,
      //   TestUser.GLOBAL_COMMUNITY_ADMIN
      // );
      // const data =
      //   response.body.data.space.opportunity.collaboration.callouts[0].posts[0]
      //     .authorization.myPrivileges;
      // // Assert
      // expect(data.sort()).toEqual(readPrivilege);
    });
  });
});
