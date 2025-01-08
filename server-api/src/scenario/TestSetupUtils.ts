import { createUser } from '@functional-api/contributor-management/user/user.request.params';
import { OrganizationWithSpaceModel } from './models/OrganizationWithSpaceModel';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';
import { CommunityRoleType } from '@generated/graphql';
import {
  getCalloutDetails,
  getCalloutsData,
} from '@functional-api/callout/callouts.request.params';
import { delay } from '@alkemio/tests-lib';
import { TestUserManager } from '@src/scenario/TestUserManager';
import { TestScenarioFactory } from './TestScenarioFactory';

export class TestSetupUtils {
  public static async assignUsersToRoles(
    roleSetId: string,
    spaceLevel: 0 | 1 | 2
  ): Promise<void> {
    await TestScenarioFactory.assignUsersToMemberRole(roleSetId, spaceLevel);

    await assignRoleToUser(
      TestUserManager.users.subspaceAdmin.id,
      roleSetId,
      CommunityRoleType.Admin
    );
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
    const subsubspaceMemberId =
      createSubsubspaceMember.data?.createUser.id ?? '';

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
  }

  public static async getDefaultSpaceCalloutByNameId(
    calloutsSetId: string,
    nameID: string
  ) {
    delay(100);
    const calloutsPerSpace = await getCalloutsData(calloutsSetId);

    const allCallouts =
      calloutsPerSpace.data?.lookup.calloutsSet?.callouts ?? [];
    const filteredCallout = allCallouts.filter(
      callout => callout.nameID.includes(nameID) || callout.id === nameID
    );

    const colloutDetails = await getCalloutDetails(filteredCallout[0].id);
    return colloutDetails;
  }
}
