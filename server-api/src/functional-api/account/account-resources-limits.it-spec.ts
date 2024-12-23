import '@utils/array.matcher';
import { TestUser } from '@common/enum/test.user';
import {
  createSpaceBasicData,
  deleteSpace,
  getSpaceData,
} from '@functional-api/journey/space/space.request.params';
import { users } from '@utils/queries/users-data';
import { uniqueId } from '@utils/uniqueId';

let localSpaceId = '';
let localSpaceIdn = '';
let localSpaceId1 = '';
let localSpaceId2 = '';
let localSpaceId3 = '';
let localSpaceId4 = '';

const organizationName = 'callout-org-name' + uniqueId;
const hostNameId = 'callout-org-nameid' + uniqueId;
const spaceName = 'callout-eco-name' + uniqueId;
const spaceNameId = 'callout-eco-nameid' + uniqueId;

describe('Limits on account resources creation', () => {
  // afterEach(async () => {
  //   await deleteSpace(localSpaceId);
  // });
  describe('Global Admin space creation', () => {
    // afterEach(async () => {
    //   await deleteSpace(localSpaceId);
    // });
    test.each`
      userRole | spaceName
      ${1}     | ${`space1-${uniqueId}`}
      ${2}     | ${`space2-${uniqueId}`}
      ${3}     | ${`space3-${uniqueId}`}
      ${3}     | ${`space4-${uniqueId}`}
    `(
      'User: Global Admin creates a space with name: $spaceName',
      async ({ spaceName }) => {
        // Act
        const createSpace = await createSpaceBasicData(
          spaceName,
          spaceNameId,
          users.globalAdmin.accountId,
          TestUser.GLOBAL_ADMIN
        );
        localSpaceId = createSpace.data?.createSpace.id ?? '';

        const spaceData = await getSpaceData(localSpaceId);

        // Assert
        expect(spaceData.data?.space.profile.displayName).toEqual(spaceName);
      }
    );
  });
  describe('Beta Tester space creation', () => {
    test.each`
      userRole | spaceName
      ${1}     | ${`space1-${uniqueId}`}
      ${2}     | ${`space2-${uniqueId}`}
      ${3}     | ${`space3-${uniqueId}`}
      ${3}     | ${`space4-${uniqueId}`}
    `(
      'User: Beta Tester creates a space with name: $spaceName',
      async ({ spaceName }) => {
        // Act
        const createSpace = await createSpaceBasicData(
          spaceName,
          spaceName,
          users.betaTester.accountId,
          TestUser.BETA_TESTER
        );
        localSpaceId = createSpace.data?.createSpace.id ?? '';

        const spaceData = await getSpaceData(localSpaceId);

        // Assert
        expect(spaceData.data?.space.profile.displayName).toEqual(spaceName);
      }
    );
  });

  describe.only('Non Space User space creation', () => {
    afterAll(async () => {
      await deleteSpace(localSpaceId1);
    });
    test.each`
      userRole | spaceName               | localSpaceIdn    | message
      ${1}     | ${`space1-${uniqueId}`} | ${localSpaceId1} | ${spaceName}
      ${2}     | ${`space2-${uniqueId}`} | ${localSpaceId2} | ${spaceName}
      ${3}     | ${`space3-${uniqueId}`} | ${localSpaceId3} | ${spaceName}
      ${3}     | ${`space4-${uniqueId}`} | ${localSpaceId4} | ${'Soft limit of 3 reached'}
    `(
      'User: Non Space User creates a space with name: $spaceName',
      async ({ spaceName, localSpaceIdn }) => {
        // Act
        const createSpace = await createSpaceBasicData(
          spaceName,
          spaceName,
          users.opportunityAdmin.accountId,
          TestUser.CHALLENGE_ADMIN
        );
        localSpaceId = createSpace.data?.createSpace.id ?? '';
        localSpaceId = localSpaceIdn;

        const spaceData = await getSpaceData(localSpaceIdn);

        // Assert
        expect(spaceData).toContain(spaceName);
      }
    );
  });
});
