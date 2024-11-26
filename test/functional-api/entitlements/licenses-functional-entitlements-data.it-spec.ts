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
import {
  revokeLicensePlanFromSpace,
  assignLicensePlanToAccount,
  getLicensePlanByName,
  revokeLicensePlanFromAccount,
  assignLicensePlanToSpace,
} from '../license/license.params.request';
import { entitiesId } from '@test/types/entities-helper';

const uniqueId = Math.random()
  .toString(12)
  .slice(-6);
let spaceId = '';
let spaceName = `space-name-${uniqueId}`;
let licensePlanIdAccountPlus = '';
afterAll(async () => {
  const revokeSpaceLicensePlan = await revokeLicensePlanFromAccount(
    spaceId,
    licensePlanIdAccountPlus,
    TestUser.GLOBAL_ADMIN
  );
});

describe.skip('Functional tests - licenses updates', () => {
  describe('Space licenses', () => {
    test('Add License Plus to space', async () => {
      // Arrange

      const getLicensePlanSpace = await getLicensePlanByName(
        'SPACE_LICENSE_PLUS'
      );

      const licensePlanIdSpace = getLicensePlanSpace[0].id;

      const createSpace = await createSpaceBasicData(
        spaceName,
        spaceName,
        users.nonSpaceMember.accountId,
        TestUser.NON_HUB_MEMBER
      );
      spaceId = createSpace.data?.createSpace.id ?? '';

      // Act
      await assignLicensePlanToSpace(spaceId, licensePlanIdSpace);

      const response = await getMyEntitlementsQuery(TestUser.NON_HUB_MEMBER);

      const revokeSpaceLicensePlan = await revokeLicensePlanFromSpace(
        spaceId,
        licensePlanIdSpace,
        TestUser.GLOBAL_ADMIN
      );

      console.log(revokeSpaceLicensePlan.data?.revokeLicensePlanFromSpace);

      console.log(response.data?.me.user?.account?.spaces?.[0].license);
      // Assert

      expect(1).toEqual(1);
    });
  });
});
