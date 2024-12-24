/**
 * Functional tests for space creation by a VC Campaign user.
 *
 * This suite tests the following scenarios:
 *
 * - Assigning the VC Campaign platform role to a user.
 * - Verifying the user's entitlements before and after creating spaces.
 * - Creating spaces with different entitlements and verifying the results.
 * - Handling the creation of a space over the license limit.
 * - Creating a space after removing a space that exceeded the license limit.
 *
 * The tests use the following utilities and queries:
 *
 * - `assignPlatformRoleToUser` and `removePlatformRoleFromUser` for managing user roles.
 * - `getMyEntitlementsQuery` for fetching user entitlements.
 * - `createSpaceBasicData` and `deleteSpace` for managing spaces.
 * - `getAccountMainEntities` for retrieving account-related data.
 *
 * The tests are organized as follows:
 *
 * - `beforeAll`: Assigns the VC Campaign role to a non-space member user.
 * - `afterAll`: Cleans up by deleting created spaces and removing the VC Campaign role from the user.
 * - `test.each`: Tests space creation with different entitlements.
 * - `test`: Tests creating a space over the license limit.
 * - `test`: Tests creating a space after removing a space that exceeded the license limit.
 */

import { TestUser } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import { getMyEntitlementsQuery } from './entitlements-request.params';
import {
  createSpaceBasicData,
  deleteSpace,
} from '@functional-api/journey/space/space.request.params';
import { getAccountMainEntities } from '../account/account.params.request';
import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();
import { PlatformRole } from '@generated/graphql';
import { assignPlatformRoleToUser, removePlatformRoleFromUser } from '@functional-api/platform/authorization-platform-mutation';

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
        TestUser.NON_SPACE_MEMBER
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
      ${`space1-${uniqueId}`} | ${allPrivileges}      | ${undefined}
      ${`space2-${uniqueId}`} | ${allPrivileges}      | ${undefined}
      ${`space3-${uniqueId}`} | ${allPrivileges}      | ${undefined}
    `(
      'User: VC campaign has license $availableEntitlements to creates a space with name: $spaceName',
      async ({ spaceName, availableEntitlements, error }) => {
        // Arrange
        const response = await getMyEntitlementsQuery(TestUser.NON_SPACE_MEMBER);

        // Act
        const createSpace = await createSpaceBasicData(
          spaceName,
          spaceName,
          users.nonSpaceMember.accountId,
          TestUser.NON_SPACE_MEMBER
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
      const response = await getMyEntitlementsQuery(TestUser.NON_SPACE_MEMBER);

      // Act
      const createSpace = await createSpaceBasicData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_SPACE_MEMBER
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
        TestUser.NON_SPACE_MEMBER
      );

      const response = await getAccountMainEntities(
        users.nonSpaceMember.accountId,
        TestUser.NON_SPACE_MEMBER
      );
      const spaceId0 = response.data?.account?.spaces?.[0].id ?? '';
      // Act
      const a = await deleteSpace(spaceId0, TestUser.GLOBAL_ADMIN);
      const responseAfter = await getMyEntitlementsQuery(
        TestUser.NON_SPACE_MEMBER
      );
      const createSpace = await createSpaceBasicData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_SPACE_MEMBER
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
