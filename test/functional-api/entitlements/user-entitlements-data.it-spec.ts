import { PlatformRole } from '@alkemio/client-lib';
import { TestUser } from '@test/utils';
import {
  assignPlatformRoleToUser,
  removePlatformRoleFromUser,
} from '@test/utils/mutations/authorization-platform-mutation';
import { users } from '@test/utils/queries/users-data';
import {
  accountNoLicenses,
  accountVCCampaignLicenses,
  accountVCCampaignLicenses1SpaceVCPack,
} from './entitlements-data';
import { getMyEntitlementsQuery } from './entitlements-request.params';
import {
  createSpaceAndGetData,
  deleteSpace,
} from '@test/functional-api/journey/space/space.request.params';
import {
  createVirtualContributorOnAccount,
  deleteVirtualContributorOnAccount,
} from '@test/functional-api/contributor-management/virtual-contributor/vc.request.params';

import {
  createInnovationPack,
  deleteInnovationPack,
} from '@test/functional-api/innovation-pack/innovation_pack.request.params';

const uniqueId = Math.random()
  .toString(12)
  .slice(-6);
let spaceId = '';
let spaceName = `space-name-${uniqueId}`;
const vcName = `vcname1-${uniqueId}`;
let vcId = '';
let innovationPackId = '';
const packName = `packname-${uniqueId}`;

describe('Get User Account Authorization and License privileges ', () => {
  test('No licenses assigned', async () => {
    // Arrange
    await removePlatformRoleFromUser(
      users.nonSpaceMember.id,
      PlatformRole.VcCampaign
    );

    // Act
    const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);
    const accountData = response.data?.me.user?.account;

    // Assert
    expect(accountData?.license?.availableEntitlements).toEqual(
      accountNoLicenses.license.availableEntitlements
    );
    expect(accountData?.license?.authorization).toEqual(
      accountNoLicenses.license.authorization
    );
    expect(accountData?.subscriptions).toEqual(accountNoLicenses.subscriptions);
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(accountNoLicenses.spaces)
    );
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(accountNoLicenses.spaces)
    );
  });

  test('VC campaign licenses assigned', async () => {
    // Arrange
    await assignPlatformRoleToUser(
      users.nonSpaceMember.id,
      PlatformRole.VcCampaign
    );

    // Act
    const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);
    const accountData = response.data?.me.user?.account;

    // Assert
    expect(accountData?.license?.availableEntitlements?.sort()).toEqual(
      accountVCCampaignLicenses.license.availableEntitlements.sort()
    );
    expect(accountData?.license?.authorization).toEqual(
      accountVCCampaignLicenses.license.authorization
    );
    expect(accountData?.subscriptions).toEqual(
      accountVCCampaignLicenses.subscriptions
    );
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(accountVCCampaignLicenses.spaces)
    );
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(accountVCCampaignLicenses.spaces)
    );

    await removePlatformRoleFromUser(
      users.nonSpaceMember.id,
      PlatformRole.VcCampaign
    );
  });
  describe('VC campaign Licenses cleanup', () => {
    afterAll(async () => {
      await deleteSpace(spaceId, TestUser.GLOBAL_ADMIN);
      await deleteVirtualContributorOnAccount(vcId, TestUser.GLOBAL_ADMIN);
      await deleteInnovationPack(innovationPackId, TestUser.GLOBAL_ADMIN);
      await removePlatformRoleFromUser(
        users.nonSpaceMember.id,
        PlatformRole.VcCampaign
      );
    });
    test('User with VC campaign licenses assigned and created Space, VC and Innovation Pack', async () => {
      // Arrange
      await assignPlatformRoleToUser(
        users.nonSpaceMember.id,
        PlatformRole.VcCampaign
      );

      const createSpace = await createSpaceAndGetData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      spaceId = createSpace.data?.space.id ?? '';

      const vcData = await createVirtualContributorOnAccount(
        vcName,
        users.nonSpaceMember.accountId,
        spaceId,
        TestUser.NON_HUB_MEMBER
      );
      vcId = vcData?.data?.createVirtualContributor?.id ?? '';

      const packData = await createInnovationPack(
        packName,
        packName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      innovationPackId = packData?.data?.createInnovationPack?.id ?? '';

      // Act
      const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);
      const accountData = response.data?.me.user?.account;

      // Assert
      expect(accountData?.license?.availableEntitlements?.sort()).toEqual(
        accountVCCampaignLicenses.license.availableEntitlements.sort()
      );
      expect(accountData?.license?.authorization).toEqual(
        accountVCCampaignLicenses1SpaceVCPack.license.authorization
      );
      expect(accountData?.subscriptions).toEqual(
        accountVCCampaignLicenses1SpaceVCPack.subscriptions
      );
      expect(accountData?.spaces[0].license.authorization).toEqual(
        accountVCCampaignLicenses1SpaceVCPack.spaces[0].license.authorization
      );
      expect(accountData?.spaces[0].license?.entitlements).toEqual(
        expect.arrayContaining(
          accountVCCampaignLicenses1SpaceVCPack.spaces[0].license.entitlements
        )
      );
    });
  });

  test('Beta tester licenses assigned', async () => {
    // Arrange
    await assignPlatformRoleToUser(
      users.nonSpaceMember.id,
      PlatformRole.BetaTester
    );

    // Act
    const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);
    const accountData = response.data?.me.user?.account;

    // Assert
    expect(accountData?.license?.availableEntitlements?.sort()).toEqual(
      accountVCCampaignLicenses.license.availableEntitlements.sort()
    );
    expect(accountData?.license?.authorization).toEqual(
      accountVCCampaignLicenses.license.authorization
    );
    expect(accountData?.subscriptions).toEqual(
      accountVCCampaignLicenses.subscriptions
    );
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(accountVCCampaignLicenses.spaces)
    );
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(accountVCCampaignLicenses.spaces)
    );

    await removePlatformRoleFromUser(
      users.nonSpaceMember.id,
      PlatformRole.BetaTester
    );
  });
  describe('BetaTested Licenses cleanup', () => {
    afterAll(async () => {
      await deleteSpace(spaceId, TestUser.GLOBAL_ADMIN);
      await deleteVirtualContributorOnAccount(vcId, TestUser.GLOBAL_ADMIN);
      await deleteInnovationPack(innovationPackId, TestUser.GLOBAL_ADMIN);
      await removePlatformRoleFromUser(
        users.nonSpaceMember.id,
        PlatformRole.BetaTester
      );
    });
    test('User with Beta tester licenses assigned and created Space, VC and Innovation Pack', async () => {
      // Arrange
      await assignPlatformRoleToUser(
        users.nonSpaceMember.id,
        PlatformRole.BetaTester
      );

      const createSpace = await createSpaceAndGetData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      spaceId = createSpace.data?.space.id ?? '';

      const vcData = await createVirtualContributorOnAccount(
        vcName,
        users.nonSpaceMember.accountId,
        spaceId,
        TestUser.NON_HUB_MEMBER
      );
      vcId = vcData?.data?.createVirtualContributor?.id ?? '';

      const packData = await createInnovationPack(
        packName,
        packName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      innovationPackId = packData?.data?.createInnovationPack?.id ?? '';

      // Act
      const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);
      const accountData = response.data?.me.user?.account;

      // Assert
      expect(accountData?.license?.availableEntitlements?.sort()).toEqual(
        accountVCCampaignLicenses1SpaceVCPack.license.availableEntitlements.sort()
      );
      expect(accountData?.license?.authorization).toEqual(
        accountVCCampaignLicenses1SpaceVCPack.license.authorization
      );
      expect(accountData?.subscriptions).toEqual(
        accountVCCampaignLicenses1SpaceVCPack.subscriptions
      );
      expect(accountData?.spaces[0].license.authorization).toEqual(
        accountVCCampaignLicenses1SpaceVCPack.spaces[0].license.authorization
      );
      expect(accountData?.spaces[0].license?.entitlements).toEqual(
        expect.arrayContaining(
          accountVCCampaignLicenses1SpaceVCPack.spaces[0].license.entitlements
        )
      );
    });
  });
});
