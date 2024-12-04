/**
 * Functional tests for Virtual Contributor (VC) creation and entitlements.
 *
 * This test suite verifies the following scenarios:
 *
 * - Assigning and removing platform roles to/from users.
 * - Creating and deleting spaces and virtual contributors.
 * - Checking user entitlements and licenses.
 *
 * The tests are organized as follows:
 *
 * - Before all tests, assign the `VcCampaign` platform role to a non-space member user.
 * - After all tests, clean up by deleting any created virtual contributors and spaces, and remove the `VcCampaign` platform role from the user.
 *
 * The tests include:
 *
 * - Creating virtual contributors with different entitlements.
 * - Verifying that the user has the correct entitlements.
 * - Attempting to create a virtual contributor over the license limit and verifying the entitlements.
 *
 */
import { PlatformRole } from '@alkemio/client-lib';
import { TestUser } from '@test/utils';
import {
  assignPlatformRoleToUser,
  removePlatformRoleFromUser,
} from '@test/utils/mutations/authorization-platform-mutation';
import { users } from '@test/utils/queries/users-data';
import { getMyEntitlementsQuery } from './entitlements-request.params';
import {
  createSpaceBasicData,
  deleteSpace,
} from '@test/functional-api/journey/space/space.request.params';
import {
  createVirtualContributorOnAccount,
  deleteVirtualContributorOnAccount,
} from '@test/functional-api/contributor-management/virtual-contributor/vc.request.params';
import { getAccountMainEntities } from '../account/account.params.request';

const uniqueId = Math.random()
  .toString(12)
  .slice(-6);
const spaceName = `space-name-${uniqueId}`;
const vcName = `vcname1-${uniqueId}`;
let vcId = '';

describe('Functional tests - VC', () => {
  afterEach(async () => {
    const spaceData = await getAccountMainEntities(
      users.nonSpaceMember.accountId,
      TestUser.NON_HUB_MEMBER
    );
    const vcs = spaceData.data?.account?.virtualContributors;
    for (const vc of vcs || []) {
      const vcId = vc.id;
      await deleteVirtualContributorOnAccount(vcId, TestUser.GLOBAL_ADMIN);
    }

    const spaces = spaceData.data?.account?.spaces;
    for (const space of spaces || []) {
      const spaceId = space.id;
      await deleteSpace(spaceId, TestUser.GLOBAL_ADMIN);
    }
  });
  describe('VC Campaign user vc creation', () => {
    beforeAll(async () => {
      await assignPlatformRoleToUser(
        users.nonSpaceMember.id,
        PlatformRole.VcCampaign
      );
    });
    const allPrivileges = [
      'ACCOUNT_SPACE_FREE',
      'ACCOUNT_INNOVATION_HUB',
      'ACCOUNT_VIRTUAL_CONTRIBUTOR',
      'ACCOUNT_INNOVATION_PACK',
    ].sort();

    const withoutCreateVs = [
      'ACCOUNT_INNOVATION_HUB',
      'ACCOUNT_INNOVATION_PACK',
      'ACCOUNT_SPACE_FREE',
    ].sort();

    afterAll(async () => {
      await removePlatformRoleFromUser(
        users.nonSpaceMember.id,
        PlatformRole.VcCampaign
      );
    });

    test.each`
      vcName               | availableEntitlements | error
      ${`vc1-${uniqueId}`} | ${allPrivileges}      | ${undefined}
      ${`vc2-${uniqueId}`} | ${allPrivileges}      | ${undefined}
      ${`vc3-${uniqueId}`} | ${allPrivileges}      | ${undefined}
    `(
      'User: VC campaign has license $availableEntitlements to creates a vc with name: $vcName',
      async ({ vcName, availableEntitlements, error }) => {
        // Arrange
        const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);

        const createSpace = await createSpaceBasicData(
          vcName,
          vcName,
          users.nonSpaceMember.accountId,
          TestUser.NON_HUB_MEMBER
        );

        const spaceId = createSpace.data?.createSpace.id ?? '';

        // Act
        const createVc = await createVirtualContributorOnAccount(
          vcName,
          users.nonSpaceMember.accountId,
          spaceId,
          TestUser.NON_HUB_MEMBER
        );
        vcId = createVc?.data?.createVirtualContributor?.id ?? '';

        // Assert
        expect(
          response?.data?.me.user?.account?.license?.availableEntitlements?.sort()
        ).toEqual(availableEntitlements);
        expect(createVc?.error?.errors?.[0].message).toEqual(error);
      }
    );

    test('Create a vc over the license limit', async () => {
      // Arrange
      const createSpace = await createSpaceBasicData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );

      const spaceId = createSpace.data?.createSpace.id ?? '';
      // Create maximum allowed VCs first
      const maxVCs = 3;
      for (let i = 0; i < maxVCs; i++) {
        const tempVcName = `temp-vc-${i}-${uniqueId}`;
        await createVirtualContributorOnAccount(
          tempVcName,
          users.nonSpaceMember.accountId,
          spaceId,
          TestUser.NON_HUB_MEMBER
        );
      }
      const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);

      // // Act
      const createVc = await createVirtualContributorOnAccount(
        vcName,
        users.nonSpaceMember.accountId,
        spaceId,
        TestUser.NON_HUB_MEMBER
      );

      // Assert
      expect(createVc.error?.errors?.[0].message).toContain(
        'Entitlement limit of 3 of type account-virtual-contributor reached'
      );
      expect(
        response?.data?.me.user?.account?.license?.availableEntitlements?.sort()
      ).toEqual(withoutCreateVs);
    });
  });
});
