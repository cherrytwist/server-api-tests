import {
  createCalloutOnCalloutsSet,
  createWhiteboardCalloutOnCalloutsSet,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { OrganizationWithSpaceModel } from './models/OrganizationWithSpaceModel';
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
import { CalloutVisibility, PlatformRole } from '@generated/alkemio-schema';
import { SpaceModel } from './models/SpaceModel';
import { createSubspace } from '@functional-api/journey/subspace/subspace.request.params';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import {
  TestScenarioConfig,
  TestScenarioSpaceConfig,
} from './config/test-scenario-config';
import { TestUserManager } from './TestUserManager';
import { UserModel } from './models/UserModel';
import { assignPlatformRoleToUser } from '@functional-api/platform/authorization-platform-mutation';
import { logElapsedTime } from '@utils/profiling';

export class TestScenarioFactory {

  public static async createBaseScenario(
    scenarioConfig: TestScenarioConfig
  ): Promise<OrganizationWithSpaceModel> {
    const start = performance.now();
    const result = await this.createBaseScenarioPrivate(scenarioConfig);
    logElapsedTime('createBaseScenario', start);
    return result;

  }

  public static async createBaseScenarioPrivate(
    scenarioConfig: TestScenarioConfig
  ): Promise<OrganizationWithSpaceModel> {
    const scenarioName = scenarioConfig.name;
    await TestUserManager.populateUserModelMap();
    await this.populateGlobalRoles();
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

  private static async populateGlobalRoles(): Promise<void> {
    await this.checkAndAssignPlatformRoleToUser(
      TestUserManager.users.globalLicenseAdmin,
      PlatformRole.LicenseManager
    );

    await this.checkAndAssignPlatformRoleToUser(
      TestUserManager.users.globalSupportAdmin,
      PlatformRole.Support
    );

    await this.checkAndAssignPlatformRoleToUser(
      TestUserManager.users.betaTester,
      PlatformRole.BetaTester
    );
  }

  private static async checkAndAssignPlatformRoleToUser(
    userModel: UserModel,
    role: PlatformRole
  ): Promise<void> {
    const alreadyHasRole = userModel.platformRoles.includes(role);
    if (!alreadyHasRole) {
      await assignPlatformRoleToUser(userModel.id, role);
    }
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
          TestUserManager.users.subspaceAdmin.id,
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
    const truncatedScenarioName = scenarioName.slice(0, 18);
    const orgName = `${truncatedScenarioName}-${uniqueId}`;
    const orgNameId = this.validateAndClean(`${orgName}`);
    if (!orgNameId) {
      throw new Error(
        `Unable to create organization: Invalid hostNameId: ${orgNameId}`
      );
    }
    const responseOrg = await createOrganization(
      orgName,
      orgNameId.toLowerCase().slice(0, 24)
    );

    if (!responseOrg.data?.createOrganization) {
      throw new Error(
        `Failed to create organization: ${JSON.stringify(responseOrg.error)}`
      );
    }

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

  private static validateAndClean(input: string): string | null {
    // Remove all spaces from the string
    const cleaned = input.replace(/\s+/g, '');

    // Validate that the string contains only letters, numbers, and "-"
    const isValid = /^[a-zA-Z0-9-]+$/.test(cleaned);

    return isValid ? cleaned : null;
  }

  private static async createRootSpace(
    spaceModel: SpaceModel,
    accountID: string,
    scenarioName: string
  ): Promise<SpaceModel> {
    const uniqueId = UniqueIDGenerator.getID();
    const truncatedScenarioName = scenarioName.slice(0, 18);
    const spaceName = `${truncatedScenarioName}-${uniqueId}`;
    const spaceNameId = this.validateAndClean(`${spaceName.toLowerCase()}`);
    if (!spaceNameId) {
      throw new Error(`Unable to create space: Invalid nameId: ${spaceNameId}`);
    }

    const responseRootSpace = await this.createSpaceAndGetData(
      spaceName,
      spaceNameId,
      accountID
    );

    if (!responseRootSpace.data?.space) {
      throw new Error(
        `Failed to create root space: ${JSON.stringify(responseRootSpace.error)}`
      );
    }

    const spaceData = responseRootSpace.data?.space;
    spaceModel.id = spaceData?.id ?? '';
    spaceModel.nameId = spaceData?.nameID ?? '';
    spaceModel.profile = {
      id: spaceData?.profile?.id ?? '',
      displayName: spaceData?.profile?.displayName ?? '',
    };
    spaceModel.collaboration.id = spaceData?.collaboration.id ?? '';
    spaceModel.collaboration.calloutsSetId = spaceData?.collaboration.calloutsSet?.id ?? '';

    return spaceModel;
  }

  private static async createCalloutsOnSpace(
    spaceModel: SpaceModel,
    scenarioName: string
  ): Promise<SpaceModel> {
    const callForPostCalloutData = await createCalloutOnCalloutsSet(
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
      callForPostCalloutData?.data?.createCalloutOnCalloutsSet?.id ?? '';

    await updateCalloutVisibility(
      spaceModel.collaboration.calloutPostCollectionId,
      CalloutVisibility.Published
    );

    const whiteboardCalloutData = await createWhiteboardCalloutOnCalloutsSet(
      spaceModel.collaboration.calloutsSetId,
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
      whiteboardCalloutData?.data?.createCalloutOnCalloutsSet?.id ?? '';

    await updateCalloutVisibility(
      spaceModel.collaboration.calloutWhiteboardId,
      CalloutVisibility.Published
    );

    const creatPostCallout = await createCalloutOnCalloutsSet(
      spaceModel.collaboration.id,
      {
        framing: {
          profile: { displayName: 'Space Post Callout' },
        },
      }
    );
    const postCalloutData = creatPostCallout.data?.createCalloutOnCalloutsSet;

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
      TestUserManager.users.subspaceAdmin.id,
      TestUserManager.users.subspaceMember.id,
      TestUserManager.users.subsubspaceAdmin.id,
      TestUserManager.users.subsubspaceMember.id,
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
        calloutsSetId: '',
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
