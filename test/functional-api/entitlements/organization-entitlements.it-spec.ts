
/**
 * This test suite verifies the organization account authorization and license privileges.
 * It includes tests for scenarios with no licenses assigned, with account licenses assigned,
 * and with account licenses plus additional resources (Space, Virtual Contributor, and Innovation Pack).
 *
 * The following utilities and data are imported:
 * - TestUser and users from '@utils'
 * - License management functions from '@functional-api/license/license.params.request'
 * - Organization entitlements data from './organization-entitlements-data'
 * - Entitlements query function from './entitlements-request.params'
 * - Space management functions from '@functional-api/journey/space/space.request.params'
 * - Virtual Contributor management functions from '@functional-api/contributor-management/virtual-contributor/vc.request.params'
 * - Innovation Pack management functions from '@functional-api/innovation-pack/innovation_pack.request.params'
 * - Organization management functions from '@functional-api/contributor-management/organization/organization.request.params'
 * - Authorization mutation function from '@utils/mutations/authorization-organization-mutation'
 *
 * The test suite includes the following tests:
 * - 'No licenses assigned': Verifies the entitlements and authorization when no licenses are assigned to the organization account.
 * - 'User admin of Organization with accountLicensesPlus assigned': Verifies the entitlements and authorization when the ACCOUNT_LICENSE_PLUS license is assigned to the organization account.
 * - 'User admin of Organization with accountLicensesPlus assigned and created Space, VC and Innovation Pack': Verifies the entitlements and authorization when the ACCOUNT_LICENSE_PLUS license is assigned and additional resources (Space, Virtual Contributor, and Innovation Pack) are created.
 *
 * The test suite also includes setup and teardown logic:
 * - `beforeAll`: Creates an organization and assigns a user as an organization admin.
 * - `afterAll`: Deletes the organization.
 * - `afterAll` in 'Account license plus cleanup': Cleans up created resources (Space, Virtual Contributor, Innovation Pack) and revokes the ACCOUNT_LICENSE_PLUS license from the organization account.
 */
import { TestUser } from '@utils/test.user';
import { users } from '@utils/queries/users-data';
import {
  assignLicensePlanToAccount,
  getLicensePlanByName,
  revokeLicensePlanFromAccount,
} from '@functional-api/license/license.params.request';
import {
  organizationAccountLicensePlus,
  organizationAccountNoLicenses,
  organizationAccountLicensePlus1SpaceVCPack,
} from './organization-entitlements-data';
import { getOrganazationEntitlementsQuery } from './entitlements-request.params';
import {
  createSpaceAndGetData,
  deleteSpace,
} from '@functional-api/journey/space/space.request.params';
import {
  createVirtualContributorOnAccount,
  deleteVirtualContributorOnAccount,
} from '@functional-api/contributor-management/virtual-contributor/vc.request.params';
import {
  createInnovationPack,
  deleteInnovationPack,
} from '@functional-api/innovation-pack/innovation_pack.request.params';
import {
  createOrganization,
  deleteOrganization,
} from '@functional-api/contributor-management/organization/organization.request.params';
import { assignUserAsOrganizationAdmin } from '@utils/mutations/authorization-organization-mutation';

const uniqueId = Math.random()
  .toString(12)
  .slice(-6);
let spaceId = '';
let orgId = '';
let vcId = '';
let innovationPackId = '';
let accountLicensePlusId = '';

let spaceName = `space-name-${uniqueId}`;
let orgName = `org-name-${uniqueId}`;
let orgAccountId = '';
const vcName = `vcname1-${uniqueId}`;
const packName = `packname-${uniqueId}`;

beforeAll(async () => {
  const licencePlanPlus = await getLicensePlanByName('ACCOUNT_LICENSE_PLUS');
  accountLicensePlusId = licencePlanPlus[0].id;

  const res = await createOrganization(orgName, orgName);
  const orgData = res.data?.createOrganization;
  orgId = orgData?.id ?? '';
  orgAccountId = orgData?.account?.id ?? '';

  await assignUserAsOrganizationAdmin(users.nonSpaceMember.id, orgId);
});

afterAll(async () => {
  await deleteOrganization(orgId);
});

describe('Get Organization Account Authorization and License privileges ', () => {
  test('No licenses assigned', async () => {
    // Arrange
    await revokeLicensePlanFromAccount(orgAccountId, accountLicensePlusId);

    // Act
    const response = await getOrganazationEntitlementsQuery(
      orgId,
      TestUser.NON_HUB_MEMBER
    );
    const accountData = response.data?.organization?.account;

    // Assert
    expect(accountData?.license?.availableEntitlements?.sort()).toEqual(
      organizationAccountNoLicenses.license.availableEntitlements.sort()
    );
    expect(accountData?.license?.authorization).toEqual(
      organizationAccountNoLicenses.license.authorization
    );
    expect(accountData?.subscriptions).toEqual(
      organizationAccountNoLicenses.subscriptions
    );
    expect(accountData?.spaces).toEqual(organizationAccountNoLicenses.spaces);
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(organizationAccountNoLicenses.spaces)
    );
  });

  test('User admin of Organization with accountLicensesPlus assigned', async () => {
    // Arrange
    await assignLicensePlanToAccount(orgAccountId, accountLicensePlusId);

    // Act
    const response = await getOrganazationEntitlementsQuery(
      orgId,
      TestUser.NON_HUB_MEMBER
    );

    // Assert
    const accountData = response.data?.organization?.account;

    // Assert
    expect(accountData?.license?.availableEntitlements?.sort()).toEqual(
      organizationAccountLicensePlus.license.availableEntitlements.sort()
    );
    expect(accountData?.license?.authorization).toEqual(
      organizationAccountLicensePlus.license.authorization
    );
    expect(accountData?.subscriptions).toEqual(
      organizationAccountLicensePlus.subscriptions
    );
    expect(accountData?.spaces).toEqual(organizationAccountLicensePlus.spaces);
    expect(accountData?.spaces).toEqual(
      expect.arrayContaining(organizationAccountLicensePlus.spaces)
    );

    await revokeLicensePlanFromAccount(orgAccountId, accountLicensePlusId);
  });

  describe('Account license plus cleanup', () => {
    afterAll(async () => {
      await deleteSpace(spaceId, TestUser.GLOBAL_ADMIN);
      await deleteVirtualContributorOnAccount(vcId, TestUser.GLOBAL_ADMIN);
      await deleteInnovationPack(innovationPackId, TestUser.GLOBAL_ADMIN);
      await revokeLicensePlanFromAccount(orgAccountId, accountLicensePlusId);
    });
    test('User admin of Organization with accountLicensesPlus assigned and created Space, VC and Innovation Pack', async () => {
      // Arrange
      await assignLicensePlanToAccount(orgAccountId, accountLicensePlusId);
      const createSpace = await createSpaceAndGetData(
        spaceName,
        spaceName,
        orgAccountId,
        TestUser.NON_HUB_MEMBER
      );
      spaceId = createSpace.data?.space.id ?? '';

      const vcData = await createVirtualContributorOnAccount(
        vcName,
        orgAccountId,
        spaceId,
        TestUser.NON_HUB_MEMBER
      );
      vcId = vcData?.data?.createVirtualContributor?.id ?? '';

      const packData = await createInnovationPack(
        packName,
        packName,
        orgAccountId,
        TestUser.NON_HUB_MEMBER
      );
      innovationPackId = packData?.data?.createInnovationPack?.id ?? '';

      // Act
      const response = await getOrganazationEntitlementsQuery(
        orgId,
        TestUser.NON_HUB_MEMBER
      );
      const accountData = response.data?.organization?.account;

      // Assert
      expect(accountData?.license?.availableEntitlements?.sort()).toEqual(
        organizationAccountLicensePlus1SpaceVCPack.license.availableEntitlements.sort()
      );
      expect(accountData?.license?.authorization).toEqual(
        organizationAccountLicensePlus1SpaceVCPack.license.authorization
      );
      expect(accountData?.subscriptions).toEqual(
        organizationAccountLicensePlus1SpaceVCPack.subscriptions
      );
      expect(accountData?.spaces[0].license.authorization).toEqual(
        organizationAccountLicensePlus1SpaceVCPack.spaces[0].license
          .authorization
      );
      expect(accountData?.spaces[0].license?.entitlements).toEqual(
        expect.arrayContaining(
          organizationAccountLicensePlus1SpaceVCPack.spaces[0].license
            .entitlements
        )
      );
    });
  });
});
