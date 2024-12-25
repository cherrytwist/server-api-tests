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
  baseScenario.organization.profile.id =
    responseOrg.data?.createOrganization.profile.id ?? '';
  baseScenario.organization.profile.displayName =
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

  baseScenario.space.community.id = spaceData?.community?.id ?? '';
  baseScenario.space.community.roleSetId = spaceData?.community?.roleSet?.id ?? '';

  baseScenario.space.communication.id =
    spaceData?.community?.communication?.id ?? '';

  baseScenario.space.communication.updatesId =
    spaceData?.community?.communication?.updates.id ?? '';
  baseScenario.space.contextId = spaceData?.context?.id ?? '';
  baseScenario.space.profile.id = spaceData?.profile?.id ?? '';
  baseScenario.space.collaboration.id = spaceData?.collaboration?.id ?? '';
  baseScenario.space.templateSetId =
    spaceData?.templatesManager?.templatesSet?.id ?? '';

  const callForPostCalloutData = await createCalloutOnCollaboration(
    baseScenario.space.collaboration.id,
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

  baseScenario.space.collaboration.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.space.collaboration.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    baseScenario.space.collaboration.id,
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

  baseScenario.space.collaboration.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.space.collaboration.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    baseScenario.space.collaboration.id,
    {
      framing: {
        profile: { displayName: 'Space Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  baseScenario.space.collaboration.discussionCalloutId = postCalloutData?.id ?? '';
  baseScenario.space.collaboration.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    baseScenario.space.collaboration.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const getDefaultSpaceCalloutByNameId = async (
  collaborationId: string,
  nameID: string
) => {
  delay(100);
  const calloutsPerSpace = await getCollaborationCalloutsData(
    (collaborationId = baseScenario.space.collaboration.id)
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
      baseScenario.space.community.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSpaceAndOrg = async () => {
  await assignUsersToSpaceAndOrgAsMembers();
  await assignRoleToUser(
    users.spaceAdmin.id,
    baseScenario.space.community.roleSetId,
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
  baseScenario.subspace.community.id = subspaceData?.community?.id ?? '';
  baseScenario.subspace.community.roleSetId = subspaceData?.community?.roleSet?.id ?? '';
  baseScenario.subspace.communication.id =
    subspaceData?.community?.communication?.id ?? '';
  baseScenario.subspace.communication.updatesId =
    subspaceData?.community?.communication?.updates.id ?? '';
  baseScenario.subspace.collaboration.id = subspaceData?.collaboration?.id ?? '';
  baseScenario.subspace.contextId = subspaceData?.context?.id ?? '';
  baseScenario.subspace.profile.id = subspaceData?.profile?.id ?? '';
  const callForPostCalloutData = await createCalloutOnCollaboration(
    baseScenario.subspace.collaboration.id,
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

  baseScenario.subspace.collaboration.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subspace.collaboration.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    baseScenario.subspace.collaboration.id,
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

  baseScenario.subspace.collaboration.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subspace.collaboration.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    baseScenario.subspace.collaboration.id,
    {
      framing: {
        profile: { displayName: 'Subspace Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  baseScenario.subspace.collaboration.discussionCalloutId = postCalloutData?.id ?? '';
  baseScenario.subspace.collaboration.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    baseScenario.subspace.collaboration.discussionCalloutId,
    CalloutVisibility.Published
  );
};

export const getDefaultSubspaceCalloutByNameId = async (
  spaceId: string,
  collaborationId: string,
  nameID: string
) => {
  const calloutsPerCollaboration = await getCollaborationCalloutsData(
    (collaborationId = baseScenario.subspace.collaboration.id)
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
      baseScenario.subspace.community.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSubspace = async () => {
  await assignUsersToSubspaceAsMembers();

  await assignRoleToUser(
    users.subspaceAdmin.id,
    baseScenario.subspace.community.roleSetId,
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
    (collaborationId = baseScenario.subsubspace.collaboration.id)
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
  baseScenario.subsubspace.community.id =
    responseSubsubspace.data?.createSubspace.community?.id ?? '';
  baseScenario.subsubspace.community.roleSetId =
    responseSubsubspace.data?.createSubspace.community?.roleSet.id ?? '';
  baseScenario.subsubspace.communication.id =
    responseSubsubspace.data?.createSubspace.community?.communication?.id ?? '';
  baseScenario.subsubspace.communication.updatesId =
    responseSubsubspace.data?.createSubspace.community?.communication?.updates
      .id ?? '';
  baseScenario.subsubspace.collaboration.id =
    responseSubsubspace.data?.createSubspace.collaboration?.id ?? '';
  baseScenario.subsubspace.contextId =
    responseSubsubspace.data?.createSubspace.context?.id ?? '';
  const callForPostCalloutData = await createCalloutOnCollaboration(
    baseScenario.subsubspace.collaboration.id,
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

  baseScenario.subsubspace.collaboration.calloutId =
    callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subsubspace.collaboration.calloutId,
    CalloutVisibility.Published
  );

  const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
    baseScenario.subsubspace.collaboration.id,
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

  baseScenario.subsubspace.collaboration.whiteboardCalloutId =
    whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

  await updateCalloutVisibility(
    baseScenario.subsubspace.collaboration.whiteboardCalloutId,
    CalloutVisibility.Published
  );

  const creatPostCallout = await createCalloutOnCollaboration(
    baseScenario.subsubspace.collaboration.id,
    {
      framing: {
        profile: { displayName: 'Subsubspace Post Callout' },
      },
    }
  );
  const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

  baseScenario.subsubspace.collaboration.discussionCalloutId = postCalloutData?.id ?? '';
  baseScenario.subsubspace.collaboration.discussionCalloutCommentsId =
    postCalloutData?.comments?.id ?? '';
  await updateCalloutVisibility(
    baseScenario.subsubspace.collaboration.discussionCalloutId,
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
      baseScenario.subsubspace.community.roleSetId,
      CommunityRoleType.Member
    );
  }
};

export const assignUsersToSubsubspace = async () => {
  await assignUsersToSubsubspaceAsMembers();
  await assignRoleToUser(
    users.subsubspaceAdmin.id,
    baseScenario.subsubspace.community.roleSetId,
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
    baseScenario.space.community.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subspaceMemberId,
    baseScenario.space.community.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subsubspaceMemberId,
    baseScenario.space.community.roleSetId,
    CommunityRoleType.Member
  );

  // Assign users to Subspace community
  await assignRoleToUser(
    subsubspaceMemberId,
    baseScenario.subspace.community.roleSetId,
    CommunityRoleType.Member
  );
  await assignRoleToUser(
    subspaceMemberId,
    baseScenario.subspace.community.roleSetId,
    CommunityRoleType.Member
  );

  // Assign users to Subsubspace community
  await assignRoleToUser(
    subsubspaceMemberId,
    baseScenario.subsubspace.community.roleSetId,
    CommunityRoleType.Member
  );
};
