import {
  createCalloutOnCollaboration,
  createWhiteboardCalloutOnCollaboration,
  getCalloutDetails,
  getCollaborationCalloutsData,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { OrganizationWithSpaceModel } from './types/OrganizationWithSpaceModel';
import { createOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import {
  createSpaceBasicData,
  getSpaceData,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { delay, TestUser, UniqueIDGenerator } from '@alkemio/tests-lib';
import { CalloutType, CommunityRoleType } from '@generated/graphql';
import { CalloutVisibility } from '@generated/alkemio-schema';
import { SpaceModel } from './types/SpaceModel';
import { createSubspace } from '@functional-api/journey/subspace/subspace.request.params';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import { users } from '@utils/queries/users-data';
import { createUser } from '@functional-api/contributor-management/user/user.request.params';

export class OrganizationWithSpaceModelFactory {
  public static async createOrganizationWithSpace(): Promise<OrganizationWithSpaceModel> {
    let model: OrganizationWithSpaceModel = this.createEmptyContext();
    const uniqueId = UniqueIDGenerator.getID();
    const organizationName = 'h-pref-org-name' + uniqueId;
    const hostNameId = 'h-pref-org-nameid' + uniqueId;
    const spaceName = 'h-pref-eco-name' + uniqueId;
    const spaceNameId = 'h-pref-eco-nameid' + uniqueId;
    model = await this.createOrgAndSpace(
      model,
      organizationName,
      hostNameId,
      spaceName,
      spaceNameId
    )
    return model;
  }

  public static async createOrganizationWithSpaceAndUsers(): Promise<OrganizationWithSpaceModel> {
    const model = await this.createOrganizationWithSpace();
    await OrganizationWithSpaceModelFactory.assignUsersToRoles(model.space.community.roleSetId);
    return model;
  }

  private static async createOrgAndSpace(
    model: OrganizationWithSpaceModel,
    organizationName: string,
    hostNameId: string,
    spaceName: string,
    spaceNameId: string
  ): Promise<OrganizationWithSpaceModel> {
    const responseOrg = await createOrganization(organizationName, hostNameId);

    model.organization.id = responseOrg.data?.createOrganization.id ?? '';
    model.organization.agentId =
      responseOrg.data?.createOrganization.agent.id ?? '';
    model.organization.accountId =
      responseOrg.data?.createOrganization.account?.id ?? '';
    model.organization.verificationId =
      responseOrg.data?.createOrganization.verification.id ?? '';
    model.organization.profile = {
      id: responseOrg.data?.createOrganization.profile.id ?? '',
      displayName:
        responseOrg.data?.createOrganization.profile.displayName ?? '',
    };

    const responseEco = await this.createSpaceAndGetData(
      spaceName,
      spaceNameId,
      model.organization.accountId
    );

    const spaceData = responseEco.data?.space;
    model.space.id = spaceData?.id ?? '';
    model.space.nameId = spaceData?.nameID ?? '';
    model.space.profile = {
      id: spaceData?.profile?.id ?? '',
      displayName: spaceData?.profile?.displayName ?? '',
    };
    model.space.collaboration.id = spaceData?.collaboration.id ?? '';

    const callForPostCalloutData = await createCalloutOnCollaboration(
      model.space.collaboration.id,
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

    model.space.collaboration.calloutPostCollectionId =
      callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

    await updateCalloutVisibility(
      model.space.collaboration.calloutPostCollectionId,
      CalloutVisibility.Published
    );

    const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
      model.space.collaboration.id,
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

    model.space.collaboration.calloutWhiteboardId =
      whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

    await updateCalloutVisibility(
      model.space.collaboration.calloutWhiteboardId,
      CalloutVisibility.Published
    );

    const creatPostCallout = await createCalloutOnCollaboration(
      model.space.collaboration.id,
      {
        framing: {
          profile: { displayName: 'Space Post Callout' },
        },
      }
    );
    const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

    model.space.collaboration.calloutPostId = postCalloutData?.id ?? '';
    model.space.collaboration.calloutPostCommentsId =
      postCalloutData?.comments?.id ?? '';
    await updateCalloutVisibility(
      model.space.collaboration.calloutPostId,
      CalloutVisibility.Published
    );

    return model;
  }

  public static async createSubspaceWithUsers(parentSpaceID: string, subspaceName: string, targetModel: SpaceModel): Promise<SpaceModel> {
    const spaceModel = await this.createSubspace(parentSpaceID, subspaceName, targetModel);
    await this.assignUsersToRoles(spaceModel.community.roleSetId);
    return spaceModel;
  }

  public static async createSubspace(parentSpaceID: string, subspaceName: string, targetModel: SpaceModel): Promise<SpaceModel> {
    const uniqueId = UniqueIDGenerator.getID();
    const responseSubspace = await createSubspace(
      subspaceName,
      `chnameid${uniqueId}`,
      parentSpaceID
    );

    const subspaceData = responseSubspace.data?.createSubspace;
    targetModel.id = subspaceData?.id ?? '';
    targetModel.nameId = subspaceData?.nameID ?? '';
    targetModel.community.id = subspaceData?.community?.id ?? '';
    targetModel.community.roleSetId = subspaceData?.community?.roleSet?.id ?? '';
    targetModel.communication.id =
      subspaceData?.community?.communication?.id ?? '';
    targetModel.communication.updatesId =
      subspaceData?.community?.communication?.updates.id ?? '';
    targetModel.collaboration.id = subspaceData?.collaboration?.id ?? '';
    targetModel.contextId = subspaceData?.context?.id ?? '';
    targetModel.profile.id = subspaceData?.profile?.id ?? '';
    const callForPostCalloutData = await createCalloutOnCollaboration(
      targetModel.collaboration.id,
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

    targetModel.collaboration.calloutPostId =
      callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

    await updateCalloutVisibility(
      targetModel.collaboration.calloutPostId,
      CalloutVisibility.Published
    );

    const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
      targetModel.collaboration.id,
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

    targetModel.collaboration.calloutWhiteboardId =
      whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

    await updateCalloutVisibility(
      targetModel.collaboration.calloutWhiteboardId,
      CalloutVisibility.Published
    );

    const creatPostCallout = await createCalloutOnCollaboration(
      targetModel.collaboration.id,
      {
        framing: {
          profile: { displayName: 'Subspace Post Callout' },
        },
      }
    );
    const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

    targetModel.collaboration.calloutPostId = postCalloutData?.id ?? '';
    targetModel.collaboration.calloutPostCommentsId =
      postCalloutData?.comments?.id ?? '';
    await updateCalloutVisibility(
      targetModel.collaboration.calloutPostId,
      CalloutVisibility.Published
    );
    return targetModel;
  };

  public static async assignUsersToRoles(roleSetId: string): Promise<void> {
    await this.assignUsersToMemberRole(roleSetId);

    await assignRoleToUser(
      users.subspaceAdmin.id,
      roleSetId,
      CommunityRoleType.Admin
    );
  };

  private static async assignUsersToMemberRole(roleSetId: string): Promise<void> {
    const usersIdsToAssign: string[] = [
      users.subspaceAdmin.id,
      users.subspaceMember.id,
      users.subsubspaceAdmin.id,
      users.subsubspaceMember.id,
    ];
    for (const userID of usersIdsToAssign) {
      await assignRoleToUser(
        userID,
        roleSetId,
        CommunityRoleType.Member
      );
    }
  };

  private static async createSpaceAndGetData(
    spaceName: string,
    spaceNameId: string,
    accountID: string,
    role = TestUser.GLOBAL_ADMIN
  ) {
    const response = await createSpaceBasicData(
      spaceName,
      spaceNameId,
      accountID,
      role
    );
    const spaceId = response?.data?.createSpace.id ?? '';
    await updateSpaceSettings(spaceId, {
      privacy: { allowPlatformSupportAsAdmin: true },
    });

    const spaceData = await getSpaceData(spaceId);

    return spaceData;
  }

  private static createEmptyContext(): OrganizationWithSpaceModel {
    return {
      organization: {
        id: '',
        agentId: '',
        accountId: '',
        verificationId: '',
        profile: {
          id: '',
          displayName: '',
        },
        nameId: '',
      },
      space: this.createEmptySpaceContext(),
      subspace: this.createEmptySpaceContext(),
      subsubspace: this.createEmptySpaceContext(),
    };
  }

  private static createEmptySpaceContext(): SpaceModel {
    return {
      id: '',
      community: {
        id: '',
        roleSetId: '',
        applicationId: '',
      },
      profile: {
        id: '',
        displayName: '',
      },
      collaboration: {
        id: '',
        calloutPostCollectionId: '',
        calloutWhiteboardId: '',
        calloutPostId: '',
        calloutPostCommentsId: '',
      },
      contextId: '',
      communication: {
        id: '',
        updatesId: '',
        messageId: '',
      },
      nameId: '',
      templateSetId: '',
    }
  }
  public static async registerUsersAndAssignToAllEntitiesAsMembers(
    orgSpaceModel: OrganizationWithSpaceModel,
    spaceMemberEmail: string,
    subspaceMemberEmail: string,
    subsubspaceMemberEmail: string
  ): Promise<void> {
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
      orgSpaceModel.space.community.roleSetId,
      CommunityRoleType.Member
    );
    await assignRoleToUser(
      subspaceMemberId,
      orgSpaceModel.space.community.roleSetId,
      CommunityRoleType.Member
    );
    await assignRoleToUser(
      subsubspaceMemberId,
      orgSpaceModel.space.community.roleSetId,
      CommunityRoleType.Member
    );

    // Assign users to Subspace community
    await assignRoleToUser(
      subsubspaceMemberId,
      orgSpaceModel.subspace.community.roleSetId,
      CommunityRoleType.Member
    );
    await assignRoleToUser(
      subspaceMemberId,
      orgSpaceModel.subspace.community.roleSetId,
      CommunityRoleType.Member
    );

    // Assign users to Subsubspace community
    await assignRoleToUser(
      subsubspaceMemberId,
      orgSpaceModel.subsubspace.community.roleSetId,
      CommunityRoleType.Member
    );
  };

  public static async getDefaultSpaceCalloutByNameId(
    collaborationId: string,
    nameID: string
  ) {
    delay(100);
    const calloutsPerSpace = await getCollaborationCalloutsData(
      (collaborationId = collaborationId)
    );

    const allCallouts =
      calloutsPerSpace.data?.lookup.collaboration?.callouts ?? [];
    const filteredCallout = allCallouts.filter(
      callout => callout.nameID.includes(nameID) || callout.id === nameID
    );

    const colloutDetails = await getCalloutDetails(filteredCallout[0].id);
    return colloutDetails;
  };

}
