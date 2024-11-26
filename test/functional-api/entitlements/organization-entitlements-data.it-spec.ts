import { TestUser } from '@test/utils';
import { users } from '@test/utils/queries/users-data';
import {
  assignLicensePlanToAccount,
  getLicensePlanByName,
  revokeLicensePlanFromAccount,
} from '@test/functional-api/license/license.params.request';
import {
  organizationAccountLicensePlus,
  organizationAccountNoLicenses,
  organizationAccountLicensePlus1SpaceVCPack,
} from './organization-entitlements-data';
import { getOrganiazationEntitlementsQuery } from './entitlements-request.params';
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
import {
  createOrganization,
  deleteOrganization,
} from '@test/functional-api/contributor-management/organization/organization.request.params';
import { assignUserAsOrganizationAdmin } from '@test/utils/mutations/authorization-organization-mutation';

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
    const response = await getOrganiazationEntitlementsQuery(
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
    const response = await getOrganiazationEntitlementsQuery(
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

  // skipped due to bug: https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/gh/alkem-io/server/4726
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
      const response = await getOrganiazationEntitlementsQuery(
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
