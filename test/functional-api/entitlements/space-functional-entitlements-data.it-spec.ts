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
import { getAccountMainEntities } from '../account/account.params.request';

const uniqueId = Math.random()
  .toString(12)
  .slice(-6);
let spaceId = '';
let spaceName = `space-name-${uniqueId}`;

describe('Functional tests - Space', () => {
  describe('VC Campaign user space creation', () => {
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
    const withoutCreateSpace = [
      'ACCOUNT_INNOVATION_HUB',
      'ACCOUNT_VIRTUAL_CONTRIBUTOR',
      'ACCOUNT_INNOVATION_PACK',
    ].sort();

    afterAll(async () => {
      const spaceData = await getAccountMainEntities(
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
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
      spaceName               | availableEntitlements | error
      ${`space1-${uniqueId}`} | ${allPrivileges}    | ${undefined}
      ${`space2-${uniqueId}`} | ${allPrivileges}    | ${undefined}
      ${`space3-${uniqueId}`} | ${allPrivileges}    | ${undefined}
    `(
      'User: VC campaign has license $availableEntitlements to creates a space with name: $spaceName',
      async ({ spaceName, availableEntitlements, error }) => {
        // Arrange
        const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);

        // Act
        const createSpace = await createSpaceBasicData(
          spaceName,
          spaceName,
          users.nonSpaceMember.accountId,
          TestUser.NON_HUB_MEMBER
        );
        spaceId = createSpace.data?.createSpace.id ?? '';

        // Assert
        expect(
          response?.data?.me.user?.account?.license?.availableEntitlements?.sort()
        ).toEqual(availableEntitlements);
        expect(createSpace?.error?.errors?.[0].message).toEqual(error);
      }
    );
    // Test is dependant on the above test
    test('Create a space over the license limit', async () => {
      // Arrange
      const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);

      // Act
      const createSpace = await createSpaceBasicData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      spaceId = createSpace.data?.createSpace.id ?? '';

      // Assert
      expect(
        response?.data?.me.user?.account?.license?.availableEntitlements?.sort()
      ).toEqual(withoutCreateSpace);
      expect(createSpace?.error?.errors?.[0].message).toEqual(
        `Unable to create account-space-free on account: ${users.nonSpaceMember.accountId}. Entitlement limit of 3 of type account-space-free reached`
      );
    });

    // Test is dependant on the above test
    test('Create a space after third over the license limit was removed', async () => {
      // Arrange
      const responseBefore = await getMyEntitlementsQuery(
        TestUser.NON_HUB_MEMBER
      );

      const response = await getAccountMainEntities(
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      const spaceId0 = response.data?.account?.spaces?.[0].id ?? '';
      // Act
      const a = await deleteSpace(spaceId0, TestUser.GLOBAL_ADMIN);
      const responseAfter = await getMyEntitlementsQuery(
        TestUser.NON_HUB_MEMBER
      );
      const createSpace = await createSpaceBasicData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      spaceId = createSpace.data?.createSpace.id ?? '';

      // Assert
      expect(
        responseBefore?.data?.me.user?.account?.license?.availableEntitlements?.sort()
      ).toEqual(withoutCreateSpace);
      expect(
        responseAfter?.data?.me.user?.account?.license?.availableEntitlements?.sort()
      ).toEqual(allPrivileges);
    });
  });
});
