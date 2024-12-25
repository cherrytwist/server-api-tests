import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import { users } from '@utils/queries/users-data';
import { createSpaceAndGetData } from '@functional-api/journey/space/space.request.params';
import { createUser } from '@functional-api/contributor-management/user/user.request.params';
import { createSubsubspace } from '../../graphql/mutations/journeys/subsubspace';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import {
  CalloutType,
  CalloutVisibility,
  CommunityRoleType,
} from '@generated/alkemio-schema';
import { TestUser } from '@alkemio/tests-lib';
import { delay } from '../../../../lib/src/utils/delay';
import { createOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { baseScenario } from '@src/types/entities-helper';
import {
  createCalloutOnCollaboration,
  createWhiteboardCalloutOnCollaboration,
  getCalloutDetails,
  getCollaborationCalloutsData,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { createSubspace } from '../../graphql/mutations/journeys/subspace';

export const createOrgAndSpace = async (
  organizationName: string,
  hostNameId: string,
  spaceName: string,
  spaceNameId: string
) => {
  const responseOrg = await createOrganization(organizationName, hostNameId);
  baseScenario.organization.agentId =
    responseOrg.data?.createOrganization.agent.id ?? '';
  baseScenario.organization.accountId =
    responseOrg.data?.createOrganization.account?.id ?? '';
  baseScenario.organization.id = responseOrg.data?.createOrganization.id ?? '';
  baseScenario.organization.verificationId =
    responseOrg.data?.createOrganization.verification.id ?? '';
  baseScenario.organization.profileId =
    responseOrg.data?.createOrganization.profile.id ?? '';
  baseScenario.organization.displayName =
    responseOrg.data?.createOrganization.profile.displayName ?? '';
  baseScenario.organization.nameId =
    responseOrg.data?.createOrganization.nameID ?? '';

  const responseEco = await createSpaceAndGetData(
    spaceName,
    spaceNameId,
    baseScenario.organization.accountId
  );
  const spaceData = responseEco.data?.space;
  baseScenario.accountId = spaceData?.account.id ?? '';
  baseScenario.space.id = spaceData?.id ?? '';

  baseScenario.space.communityId = spaceData?.community?.id ?? '';
  baseScenario.space.roleSetId = spaceData?.community?.roleSet?.id ?? '';

  baseScenario.space.communicationId =
    spaceData?.community?.communication?.id ?? '';

  baseScenario.space.updatesId =
    spaceData?.community?.communication?.updates.id ?? '';
  baseScenario.space.contextId = spaceData?.context?.id ?? '';
  baseScenario.space.profileId = spaceData?.profile?.id ?? '';
  baseScenario.space.collaborationId = spaceData?.collaboration?.id ?? '';
  baseScenario.space.templateSetId =
    spaceData?.templatesManager?.templatesSet?.id ?? '';

  const callForPostCalloutData = await createCalloutOnCollaboration(
    baseScenario.space.collaborationId,
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

  baseScenario.space.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.space.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    baseScenario.space.collaborationId,
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

  baseScenario.space.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.space.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    baseScenario.space.collaborationId,
    {
      framing: {
        profile: { displayName: 'Space Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  baseScenario.space.discussionCalloutId = postCalloutData?.id ?? '';
  baseScenario.space.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    baseScenario.space.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const getDefaultSpaceCalloutByNameId = async (
  collaborationId: string,
  nameID: string
) => {
  delay(100);
  const calloutsPerSpace = await getCollaborationCalloutsData(
    (collaborationId = baseScenario.space.collaborationId)
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
      baseScenario.space.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSpaceAndOrg = async () => {
  await assignUsersToSpaceAndOrgAsMembers();
  await assignRoleToUser(
    users.spaceAdmin.id,
    baseScenario.space.roleSetId,
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
    baseScenario.space.id
  );

  const subspaceData = responseSubspace.data?.createSubspace;
  baseScenario.subspace.id = subspaceData?.id ?? '';
  baseScenario.subspace.nameId = subspaceData?.nameID ?? '';
  baseScenario.subspace.communityId = subspaceData?.community?.id ?? '';
  baseScenario.subspace.roleSetId = subspaceData?.community?.roleSet?.id ?? '';
  baseScenario.subspace.communicationId =
    subspaceData?.community?.communication?.id ?? '';
  baseScenario.subspace.updatesId =
    subspaceData?.community?.communication?.updates.id ?? '';
  baseScenario.subspace.collaborationId = subspaceData?.collaboration?.id ?? '';
  baseScenario.subspace.contextId = subspaceData?.context?.id ?? '';
  baseScenario.subspace.profileId = subspaceData?.profile?.id ?? '';
  const callForPostCalloutData = await createCalloutOnCollaboration(
    baseScenario.subspace.collaborationId,
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

  baseScenario.subspace.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subspace.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    baseScenario.subspace.collaborationId,
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

  baseScenario.subspace.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subspace.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    baseScenario.subspace.collaborationId,
    {
      framing: {
        profile: { displayName: 'Subspace Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  baseScenario.subspace.discussionCalloutId = postCalloutData?.id ?? '';
  baseScenario.subspace.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    baseScenario.subspace.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const getDefaultSubspaceCalloutByNameId = async (
  spaceId: string,
  collaborationId: string,
  nameID: string
) => {
  const calloutsPerCollaboration = await getCollaborationCalloutsData(
    (collaborationId = baseScenario.subspace.collaborationId)
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
      baseScenario.subspace.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSubspace = async () => {
  await assignUsersToSubspaceAsMembers();

  await assignRoleToUser(
    users.subspaceAdmin.id,
    baseScenario.subspace.roleSetId,
    CommunityRoleType.Admin
  );
};

export const createSubspaceWithUsers = async (subspaceName: string) => {
  await createSubspaceForOrgSpace(subspaceName);
  await assignUsersToSubspace();
};

export const getDefaultSubsubspaceCalloutByNameId = async (
  spaceId: string,
  collaborationId: string,
  nameID: string
) => {
  const calloutsPerCollaboration = await getCollaborationCalloutsData(
    (collaborationId = baseScenario.subsubspace.collaborationId)
  );

  const allCallouts =
    calloutsPerCollaboration.data?.lookup?.collaboration?.callouts ?? [];
  const filteredCallout = allCallouts.filter(
    callout => callout.nameID.includes(nameID) || callout.id === nameID
  );
  const colloutDetails = await getCalloutDetails(filteredCallout[0]?.id);
  return colloutDetails?.data?.lookup?.callout;
};

export const createSubsubspaceForSubspace = async (
  subsubspaceName: string
) => {
  const responseSubsubspace = await createSubsubspace(
    subsubspaceName,
    `opp-${uniqueId}`,
    baseScenario.subspace.id
  );

  baseScenario.subsubspace.id = responseSubsubspace.data?.createSubspace.id ?? '';
  baseScenario.subsubspace.nameId =
    responseSubsubspace.data?.createSubspace.nameID ?? '';
  baseScenario.subsubspace.communityId =
    responseSubsubspace.data?.createSubspace.community?.id ?? '';
  baseScenario.subsubspace.roleSetId =
    responseSubsubspace.data?.createSubspace.community?.roleSet.id ?? '';
  baseScenario.subsubspace.communicationId =
    responseSubsubspace.data?.createSubspace.community?.communication?.id ?? '';
  baseScenario.subsubspace.updatesId =
    responseSubsubspace.data?.createSubspace.community?.communication?.updates
      .id ?? '';
  baseScenario.subsubspace.collaborationId =
    responseSubsubspace.data?.createSubspace.collaboration?.id ?? '';
  baseScenario.subsubspace.contextId =
    responseSubsubspace.data?.createSubspace.context?.id ?? '';
  const callForPostCalloutData = await createCalloutOnCollaboration(
    baseScenario.subsubspace.collaborationId,
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

  baseScenario.subsubspace.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subsubspace.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    baseScenario.subsubspace.collaborationId,
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

  baseScenario.subsubspace.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subsubspace.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    baseScenario.subsubspace.collaborationId,
    {
      framing: {
        profile: { displayName: 'Subsubspace Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  baseScenario.subsubspace.discussionCalloutId = postCalloutData?.id ?? '';
  baseScenario.subsubspace.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    baseScenario.subsubspace.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const assignUsersToSubsubspaceAsMembers = async () => {
  const usersToAssign: string[] = [
    users.subsubspaceAdmin.id,
    users.subsubspaceMember.id,
  ];
  for (const user of usersToAssign) {
    await assignRoleToUser(
      user,
      baseScenario.subsubspace.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSubsubspace = async () => {
  await assignUsersToSubsubspaceAsMembers();
  await assignRoleToUser(
    users.subsubspaceAdmin.id,
    baseScenario.subsubspace.roleSetId,
    CommunityRoleType.Admin
  );
};

export const createSubsubspaceWithUsers = async (subsubspaceName: string) => {
  await createSubsubspaceForSubspace(subsubspaceName);
  await assignUsersToSubsubspace();
};

export const registerUsersAndAssignToAllEntitiesAsMembers = async (
  spaceMemberEmail: string,
  subspaceMemberEmail: string,
  subsubspaceMemberEmail: string
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

  const createSubsubspaceMember = await createUser({
    firstName: 'opp',
    lastName: 'mem',
    email: subsubspaceMemberEmail,
  });
  const subsubspaceMemberId = createSubsubspaceMember.data?.createUser.id ?? '';

  // Assign users to Space community
  await assignRoleToUser(
    spaceMemberId,
    baseScenario.space.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subspaceMemberId,
    baseScenario.space.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subsubspaceMemberId,
    baseScenario.space.roleSetId,
    CommunityRoleType.Member
  );

  // Assign users to Subspace community
  await assignRoleToUser(
    subsubspaceMemberId,
    baseScenario.subspace.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subspaceMemberId,
    baseScenario.subspace.roleSetId,
    CommunityRoleType.Member
  );

  // Assign users to Subsubspace community
  await assignRoleToUser(
    subsubspaceMemberId,
    baseScenario.subsubspace.roleSetId,
    CommunityRoleType.Member
  );
};
