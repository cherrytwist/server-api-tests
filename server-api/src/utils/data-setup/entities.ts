import { uniqueId } from '@utils/uniqueId';
import { users } from '@utils/queries/users-data';
import { createSpaceAndGetData } from '@functional-api/journey/space/space.request.params';
import { createUser } from '@functional-api/contributor-management/user/user.request.params';
import { createSubsubspace } from '../mutations/journeys/subsubspace';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import {
  CalloutType,
  CalloutVisibility,
  CommunityRoleType,
} from '@generated/alkemio-schema';
import { TestUser } from '@alkemio/tests-lib';
import { delay } from '../../../../lib/src/utils/delay';
import { createOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { entitiesId } from '@src/types/entities-helper';
import {
  createCalloutOnCollaboration,
  createWhiteboardCalloutOnCollaboration,
  getCalloutDetails,
  getCollaborationCalloutsData,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { createSubspace } from '../mutations/journeys/subspace';

export const createOrgAndSpace = async (
  organizationName: string,
  hostNameId: string,
  spaceName: string,
  spaceNameId: string
) => {
  const responseOrg = await createOrganization(organizationName, hostNameId);
  entitiesId.organization.agentId =
    responseOrg.data?.createOrganization.agent.id ?? '';
  entitiesId.organization.accountId =
    responseOrg.data?.createOrganization.account?.id ?? '';
  entitiesId.organization.id = responseOrg.data?.createOrganization.id ?? '';
  entitiesId.organization.verificationId =
    responseOrg.data?.createOrganization.verification.id ?? '';
  entitiesId.organization.profileId =
    responseOrg.data?.createOrganization.profile.id ?? '';
  entitiesId.organization.displayName =
    responseOrg.data?.createOrganization.profile.displayName ?? '';
  entitiesId.organization.nameId =
    responseOrg.data?.createOrganization.nameID ?? '';

  const responseEco = await createSpaceAndGetData(
    spaceName,
    spaceNameId,
    entitiesId.organization.accountId
  );
  const spaceData = responseEco.data?.space;
  entitiesId.accountId = spaceData?.account.id ?? '';
  entitiesId.spaceId = spaceData?.id ?? '';

  entitiesId.space.communityId = spaceData?.community?.id ?? '';
  entitiesId.space.roleSetId = spaceData?.community?.roleSet?.id ?? '';

  entitiesId.space.communicationId =
    spaceData?.community?.communication?.id ?? '';

  entitiesId.space.updatesId =
    spaceData?.community?.communication?.updates.id ?? '';
  entitiesId.space.contextId = spaceData?.context?.id ?? '';
  entitiesId.space.profileId = spaceData?.profile?.id ?? '';
  entitiesId.space.collaborationId = spaceData?.collaboration?.id ?? '';
  entitiesId.space.templateSetId =
    spaceData?.templatesManager?.templatesSet?.id ?? '';

  const callForPostCalloutData = await createCalloutOnCollaboration(
    entitiesId.space.collaborationId,
    {
      framing: {
        profile: {
          displayName: 'callForPostCalloutData-Initial',
          description: 'Aspect - initial',
        },
      },
      type: CalloutType.PostCollection,
    }
  );

  entitiesId.space.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    entitiesId.space.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    entitiesId.space.collaborationId,
    {
      framing: {
        profile: {
          displayName: 'whiteboard callout space-Initial',
          description: 'Whiteboard - initial',
        },
      },
      type: CalloutType.WhiteboardCollection,
    },
    TestUser.GLOBAL_ADMIN
  );

  entitiesId.space.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    entitiesId.space.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    entitiesId.space.collaborationId,
    {
      framing: {
        profile: { displayName: 'Space Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  entitiesId.space.discussionCalloutId = postCalloutData?.id ?? '';
  entitiesId.space.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    entitiesId.space.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const getDefaultSpaceCalloutByNameId = async (
  collaborationId: string,
  nameID: string
) => {
  delay(100);
  const calloutsPerSpace = await getCollaborationCalloutsData(
    (collaborationId = entitiesId.space.collaborationId)
  );

  const allCallouts =
    calloutsPerSpace.data?.lookup.collaboration?.callouts ?? [];
  const filteredCallout = allCallouts.filter(
    callout => callout.nameID.includes(nameID) || callout.id === nameID
  );

  const colloutDetails = await getCalloutDetails(filteredCallout[0].id);
  return colloutDetails;
};

export const assignUsersToSpaceAndOrgAsMembers = async () => {
  const usersIdsToAssign: string[] = [
    users.spaceAdmin.id,
    users.spaceMember.id,
    users.subspaceAdmin.id,
    users.subspaceMember.id,
    users.subsubspaceAdmin.id,
    users.subsubspaceMember.id,
  ];
  for (const userId of usersIdsToAssign) {
    await assignRoleToUser(
      userId,
      entitiesId.space.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSpaceAndOrg = async () => {
  await assignUsersToSpaceAndOrgAsMembers();
  await assignRoleToUser(
    users.spaceAdmin.id,
    entitiesId.space.roleSetId,
    CommunityRoleType.Admin
  );
};

export const createOrgAndSpaceWithUsers = async (
  organizationName: string,
  hostNameId: string,
  spaceName: string,
  spaceNameId: string
) => {
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
  await assignUsersToSpaceAndOrg();
};

export const createSubspaceForOrgSpace = async (subspaceName: string) => {
  const responseSubspace = await createSubspace(
    subspaceName,
    `chnameid${uniqueId}`,
    entitiesId.spaceId
  );

  const subspaceData = responseSubspace.data?.createSubspace;
  entitiesId.subspace.id = subspaceData?.id ?? '';
  entitiesId.subspace.nameId = subspaceData?.nameID ?? '';
  entitiesId.subspace.communityId = subspaceData?.community?.id ?? '';
  entitiesId.subspace.roleSetId = subspaceData?.community?.roleSet?.id ?? '';
  entitiesId.subspace.communicationId =
    subspaceData?.community?.communication?.id ?? '';
  entitiesId.subspace.updatesId =
    subspaceData?.community?.communication?.updates.id ?? '';
  entitiesId.subspace.collaborationId = subspaceData?.collaboration?.id ?? '';
  entitiesId.subspace.contextId = subspaceData?.context?.id ?? '';
  entitiesId.subspace.profileId = subspaceData?.profile?.id ?? '';
  const callForPostCalloutData = await createCalloutOnCollaboration(
    entitiesId.subspace.collaborationId,
    {
      framing: {
        profile: {
          displayName: 'callForPostCalloutData-Initial',
          description: 'Aspect - initial',
        },
      },
      type: CalloutType.PostCollection,
    }
  );

  entitiesId.subspace.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    entitiesId.subspace.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    entitiesId.subspace.collaborationId,
    {
      framing: {
        profile: {
          displayName: 'whiteboard callout space-Initial',
          description: 'Whiteboard - initial',
        },
      },
      type: CalloutType.WhiteboardCollection,
    },
    TestUser.GLOBAL_ADMIN
  );

  entitiesId.subspace.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    entitiesId.subspace.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    entitiesId.subspace.collaborationId,
    {
      framing: {
        profile: { displayName: 'Subspace Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  entitiesId.subspace.discussionCalloutId = postCalloutData?.id ?? '';
  entitiesId.subspace.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    entitiesId.subspace.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const getDefaultSubspaceCalloutByNameId = async (
  spaceId: string,
  collaborationId: string,
  nameID: string
) => {
  const calloutsPerCollaboration = await getCollaborationCalloutsData(
    (collaborationId = entitiesId.subspace.collaborationId)
  );
  const allCallouts =
    calloutsPerCollaboration.data?.lookup?.collaboration?.callouts ?? [];
  const filteredCallout = allCallouts.filter(
    callout => callout.nameID.includes(nameID) || callout.id === nameID
  );
  const colloutDetails = await getCalloutDetails(filteredCallout[0]?.id);
  return colloutDetails;
};

export const assignUsersToSubspaceAsMembers = async () => {
  const usersIdsToAssign: string[] = [
    users.subspaceAdmin.id,
    users.subspaceMember.id,
    users.subsubspaceAdmin.id,
    users.subsubspaceMember.id,
  ];
  for (const userID of usersIdsToAssign) {
    await assignRoleToUser(
      userID,
      entitiesId.subspace.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSubspace = async () => {
  await assignUsersToSubspaceAsMembers();

  await assignRoleToUser(
    users.subspaceAdmin.id,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Admin
  );
};

export const createSubspaceWithUsers = async (subspaceName: string) => {
  await createSubspaceForOrgSpace(subspaceName);
  await assignUsersToSubspace();
};

export const getDefaultOpportunityCalloutByNameId = async (
  spaceId: string,
  collaborationId: string,
  nameID: string
) => {
  const calloutsPerCollaboration = await getCollaborationCalloutsData(
    (collaborationId = entitiesId.subsubspace.collaborationId)
  );

  const allCallouts =
    calloutsPerCollaboration.data?.lookup?.collaboration?.callouts ?? [];
  const filteredCallout = allCallouts.filter(
    callout => callout.nameID.includes(nameID) || callout.id === nameID
  );
  const colloutDetails = await getCalloutDetails(filteredCallout[0]?.id);
  return colloutDetails?.data?.lookup?.callout;
};

export const createOpportunityForSubspace = async (
  opportunityName: string
) => {
  const responseOpportunity = await createSubsubspace(
    opportunityName,
    `opp-${uniqueId}`,
    entitiesId.subspace.id
  );

  entitiesId.subsubspace.id = responseOpportunity.data?.createSubspace.id ?? '';
  entitiesId.subsubspace.nameId =
    responseOpportunity.data?.createSubspace.nameID ?? '';
  entitiesId.subsubspace.communityId =
    responseOpportunity.data?.createSubspace.community?.id ?? '';
  entitiesId.subsubspace.roleSetId =
    responseOpportunity.data?.createSubspace.community?.roleSet.id ?? '';
  entitiesId.subsubspace.communicationId =
    responseOpportunity.data?.createSubspace.community?.communication?.id ?? '';
  entitiesId.subsubspace.updatesId =
    responseOpportunity.data?.createSubspace.community?.communication?.updates
      .id ?? '';
  entitiesId.subsubspace.collaborationId =
    responseOpportunity.data?.createSubspace.collaboration?.id ?? '';
  entitiesId.subsubspace.contextId =
    responseOpportunity.data?.createSubspace.context?.id ?? '';
  const callForPostCalloutData = await createCalloutOnCollaboration(
    entitiesId.subsubspace.collaborationId,
    {
      framing: {
        profile: {
          displayName: 'callForPostCalloutData-Initial',
          description: 'Aspect - initial',
        },
      },
      type: CalloutType.PostCollection,
    }
  );

  entitiesId.subsubspace.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    entitiesId.subsubspace.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    entitiesId.subsubspace.collaborationId,
    {
      framing: {
        profile: {
          displayName: 'whiteboard callout space-Initial',
          description: 'Whiteboard - initial',
        },
      },
      type: CalloutType.WhiteboardCollection,
    },
    TestUser.GLOBAL_ADMIN
  );

  entitiesId.subsubspace.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    entitiesId.subsubspace.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    entitiesId.subsubspace.collaborationId,
    {
      framing: {
        profile: { displayName: 'Opportunity Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  entitiesId.subsubspace.discussionCalloutId = postCalloutData?.id ?? '';
  entitiesId.subsubspace.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    entitiesId.subsubspace.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const assignUsersToOpportunityAsMembers = async () => {
  const usersToAssign: string[] = [
    users.subsubspaceAdmin.id,
    users.subsubspaceMember.id,
  ];
  for (const user of usersToAssign) {
    await assignRoleToUser(
      user,
      entitiesId.subsubspace.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToOpportunity = async () => {
  await assignUsersToOpportunityAsMembers();
  await assignRoleToUser(
    users.subsubspaceAdmin.id,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Admin
  );
};

export const createOpportunityWithUsers = async (opportunityName: string) => {
  await createOpportunityForSubspace(opportunityName);
  await assignUsersToOpportunity();
};

export const registerUsersAndAssignToAllEntitiesAsMembers = async (
  spaceMemberEmail: string,
  subspaceMemberEmail: string,
  opportunityMemberEmail: string
) => {
  const createSpaceMember = await createUser({
    firstName: 'space',
    lastName: 'mem',
    email: spaceMemberEmail,
  });
  const spaceMemberId = createSpaceMember.data?.createUser.id ?? '';
  const createSubspaceMember = await createUser({
    firstName: 'chal',
    lastName: 'mem',
    email: subspaceMemberEmail,
  });
  const subspaceMemberId = createSubspaceMember.data?.createUser.id ?? '';

  const createOpportunityMember = await createUser({
    firstName: 'opp',
    lastName: 'mem',
    email: opportunityMemberEmail,
  });
  const opportunityMemberId = createOpportunityMember.data?.createUser.id ?? '';

  // Assign users to Space community
  await assignRoleToUser(
    spaceMemberId,
    entitiesId.space.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subspaceMemberId,
    entitiesId.space.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    opportunityMemberId,
    entitiesId.space.roleSetId,
    CommunityRoleType.Member
  );

  // Assign users to Subspace community
  await assignRoleToUser(
    opportunityMemberId,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subspaceMemberId,
    entitiesId.subspace.roleSetId,
    CommunityRoleType.Member
  );

  // Assign users to Opportunity community
  await assignRoleToUser(
    opportunityMemberId,
    entitiesId.subsubspace.roleSetId,
    CommunityRoleType.Member
  );
};
