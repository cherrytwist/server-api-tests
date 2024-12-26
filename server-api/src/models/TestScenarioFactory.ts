import {
  createCalloutOnCollaboration,
  createWhiteboardCalloutOnCollaboration,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { OrganizationWithSpaceModel } from './types/OrganizationWithSpaceModel';
import {
  createOrganization,
  deleteOrganization,
} from '@functional-api/contributor-management/organization/organization.request.params';
import {
  createSpaceBasicData,
  deleteSpace,
  getSpaceData,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';
import { TestUser, UniqueIDGenerator } from '@alkemio/tests-lib';
import { CalloutType, CommunityRoleType } from '@generated/graphql';
import { CalloutVisibility } from '@generated/alkemio-schema';
import { SpaceModel } from './types/SpaceModel';
import { createSubspace } from '@functional-api/journey/subspace/subspace.request.params';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import { users } from '@utils/queries/users-data';
import {
  TestScenarioConfig,
  TestScenarioSpaceConfig,
} from './test-scenario-config';

export class TestScenarioFactory {

  public static async createBaseScenario(
    scenarioConfig: TestScenarioConfig
  ): Promise<OrganizationWithSpaceModel> {
    const scenarioName = scenarioConfig.name;
    const baseScenario = await this.createOrganization(scenarioName);
    if (!scenarioConfig.space) {
      // nothing more to do, return
      return baseScenario;
    }
    //
    baseScenario.space = await this.createRootSpace(
      baseScenario.space,
      baseScenario.organization.accountId,
      scenarioName
    );

    await this.populateSpace(
      scenarioConfig.space,
      baseScenario.space,
      scenarioName
    );

    const subspace = scenarioConfig.space.subspace;
    if (!subspace) {
      // all done, return
      return baseScenario;
    }

    await this.createSubspace(
      baseScenario.space.id,
      scenarioName,
      baseScenario.subspace
    );
    await this.populateSpace(subspace, baseScenario.subspace, scenarioName);

    const subsubspace = subspace.subspace;
    if (!subsubspace) {
      // all done, return
      return baseScenario;
    }

    await this.createSubspace(
      baseScenario.subspace.id,
      scenarioName,
      baseScenario.subsubspace
    );
    await this.populateSpace(
      subsubspace,
      baseScenario.subsubspace,
      scenarioName
    );

    return baseScenario;
  }

  public static async cleanUpBaseScenario(
    baseScenario: OrganizationWithSpaceModel
  ): Promise<void> {
    if (baseScenario.subsubspace.id.length > 0) {
      await deleteSpace(baseScenario.subsubspace.id);
    }
    if (baseScenario.subspace.id.length > 0) {
      await deleteSpace(baseScenario.subspace.id);
    }
    if (baseScenario.space.id.length > 0) {
      await deleteSpace(baseScenario.space.id);
    }
    await deleteOrganization(baseScenario.organization.id);
  }

  private static async populateSpace(
    spaceConfig: TestScenarioSpaceConfig,
    spaceModel: SpaceModel,
    scenarioName: string
  ): Promise<SpaceModel> {
    const roleSetID = spaceModel.community.roleSetId;
    const spaceCommunityConfig = spaceConfig.community;
    if (spaceCommunityConfig) {
      if (spaceCommunityConfig.addMembers) {
        await this.assignUsersToMemberRole(roleSetID);
      }
      if (spaceCommunityConfig.addAdmin) {
        await assignRoleToUser(
          users.subspaceAdmin.id,
          roleSetID,
          CommunityRoleType.Admin
        );
      }
    }
    const spaceCollaborationConfig = spaceConfig.collaboration;
    if (spaceCollaborationConfig) {
      if (spaceCollaborationConfig.addCallouts) {
        await this.createCalloutsOnSpace(spaceModel, scenarioName);
      }
    }
    return spaceModel;
  }

  private static async createOrganization(
    scenarioName: string
  ): Promise<OrganizationWithSpaceModel> {
    const model: OrganizationWithSpaceModel = this.createEmptyBaseScenario();
    const uniqueId = UniqueIDGenerator.getID();
    const organizationName = `${scenarioName} - org-name-${uniqueId}`;
    const hostNameId = `${scenarioName} - org-nameid-${uniqueId}`;
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
    return model;
  }

  private static async createRootSpace(
    spaceModel: SpaceModel,
    accountID: string,
    scenarioName: string
  ): Promise<SpaceModel> {
    const uniqueId = UniqueIDGenerator.getID();
    const spaceName = `space-l0-${scenarioName}-${uniqueId}`;
    const spaceNameId = `space-${scenarioName.toLowerCase()}-${uniqueId}`;
    const responseEco = await this.createSpaceAndGetData(
      spaceName,
      spaceNameId,
      accountID
    );

    const spaceData = responseEco.data?.space;
    spaceModel.id = spaceData?.id ?? '';
    spaceModel.nameId = spaceData?.nameID ?? '';
    spaceModel.profile = {
      id: spaceData?.profile?.id ?? '',
      displayName: spaceData?.profile?.displayName ?? '',
    };
    spaceModel.collaboration.id = spaceData?.collaboration.id ?? '';

    return spaceModel;
  }

  private static async createCalloutsOnSpace(
    spaceModel: SpaceModel,
    scenarioName: string
  ): Promise<SpaceModel> {
    const callForPostCalloutData = await createCalloutOnCollaboration(
      spaceModel.collaboration.id,
      {
        framing: {
          profile: {
            displayName: `postCollectioinCallout-${scenarioName}`,
            description: `postCollectionCallout-${scenarioName} - created as part of scenario setup for tests`,
          },
        },
        type: CalloutType.PostCollection,
      }
    );

    spaceModel.collaboration.calloutPostCollectionId =
      callForPostCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

    await updateCalloutVisibility(
      spaceModel.collaboration.calloutPostCollectionId,
      CalloutVisibility.Published
    );

    const whiteboardCalloutData = await createWhiteboardCalloutOnCollaboration(
      spaceModel.collaboration.id,
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

    spaceModel.collaboration.calloutWhiteboardId =
      whiteboardCalloutData?.data?.createCalloutOnCollaboration?.id ?? '';

    await updateCalloutVisibility(
      spaceModel.collaboration.calloutWhiteboardId,
      CalloutVisibility.Published
    );

    const creatPostCallout = await createCalloutOnCollaboration(
      spaceModel.collaboration.id,
      {
        framing: {
          profile: { displayName: 'Space Post Callout' },
        },
      }
    );
    const postCalloutData = creatPostCallout.data?.createCalloutOnCollaboration;

    spaceModel.collaboration.calloutPostId = postCalloutData?.id ?? '';
    spaceModel.collaboration.calloutPostCommentsId =
      postCalloutData?.comments?.id ?? '';
    await updateCalloutVisibility(
      spaceModel.collaboration.calloutPostId,
      CalloutVisibility.Published
    );

    return spaceModel;
  }

  private static async createSubspace(
    parentSpaceID: string,
    subspaceName: string,
    targetModel: SpaceModel
  ): Promise<SpaceModel> {
    const uniqueId = UniqueIDGenerator.getID();
    const responseSubspace = await createSubspace(
      subspaceName,
      `ssnameid${uniqueId}`,
      parentSpaceID
    );

    const subspaceData = responseSubspace.data?.createSubspace;
    targetModel.id = subspaceData?.id ?? '';
    targetModel.nameId = subspaceData?.nameID ?? '';
    targetModel.community.id = subspaceData?.community?.id ?? '';
    targetModel.community.roleSetId =
      subspaceData?.community?.roleSet?.id ?? '';
    targetModel.communication.id =
      subspaceData?.community?.communication?.id ?? '';
    targetModel.communication.updatesId =
      subspaceData?.community?.communication?.updates.id ?? '';
    targetModel.collaboration.id = subspaceData?.collaboration?.id ?? '';
    targetModel.contextId = subspaceData?.context?.id ?? '';
    targetModel.profile.id = subspaceData?.profile?.id ?? '';

    return targetModel;
  }

  public static async assignUsersToMemberRole(
    roleSetId: string
  ): Promise<void> {
    const usersIdsToAssign: string[] = [
      users.subspaceAdmin.id,
      users.subspaceMember.id,
      users.subsubspaceAdmin.id,
      users.subsubspaceMember.id,
    ];
    for (const userID of usersIdsToAssign) {
      await assignRoleToUser(userID, roleSetId, CommunityRoleType.Member);
    }
  }

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

  private static createEmptyBaseScenario(): OrganizationWithSpaceModel {
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
    };
  }


}
