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
let spaceName = `space-name-${uniqueId}`;
const vcName = `vcname1-${uniqueId}`;
let vcId = '';

describe('Functional tests - VC', () => {
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
    const withoutCreateSpaceAndVs = [
      'ACCOUNT_INNOVATION_HUB',
      'ACCOUNT_INNOVATION_PACK',
    ].sort();

    afterAll(async () => {
      const spaceData = await getAccountMainEntities(
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      const vcs = spaceData.data?.account?.virtualContributors;
      for (const vc of vcs || []) {
        const vcId = vc.id;
        const a = await deleteVirtualContributorOnAccount(
          vcId,
          TestUser.GLOBAL_ADMIN
        );
      }

      const spaces = spaceData.data?.account?.spaces;
      for (const space of spaces || []) {
        const spaceId = space.id;
        await deleteSpace(spaceId, TestUser.GLOBAL_ADMIN);
      }

      await removePlatformRoleFromUser(
        users.nonSpaceMember.id,
        PlatformRole.VcCampaign
      );
    });

    test.each`
      vcName               | availableEntitlements | error
      ${`vc1-${uniqueId}`} | ${allPrivileges}    | ${undefined}
      ${`vc2-${uniqueId}`} | ${allPrivileges}    | ${undefined}
      ${`vc3-${uniqueId}`} | ${allPrivileges}    | ${undefined}
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
    // Test is dependant on the above test
    test('Create a vc over the license limit', async () => {
      // Arrange
      const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);
      const createSpace = await createSpaceBasicData(
        spaceName,
        spaceName,
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
      ).toEqual(withoutCreateSpaceAndVs);
    });
  });
});
