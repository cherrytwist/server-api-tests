import { entitiesId } from '@test/functional-api/zcommunications/communications-helper';
import { TestUser } from '@test/utils';
import { uniqueId } from '@test/utils/mutations/create-mutation';
import '../../../utils/array.matcher';
import {
  getSpaceDataCodegen,
  updateSpaceVisibilityCodegen,
  getUserRoleSpacesVisibilityCodegen,
  getPrivateSpaceDataCodegen,
  getSpacesFilteredByVisibilityWithAccessCodegen,
  getSpacesFilteredByVisibilityNoAccessCodegen,
  deleteSpaceCodegen,
} from './space.request.params';
import {
  createOrganizationCodegen,
  deleteOrganizationCodegen,
} from '@test/functional-api/organization/organization.request.params';
import {
  readPrivilege,
  sorted__create_read_update_delete_grant_createChallenge,
  sorted__create_read_update_delete_grant_authorizationReset_createChallenge_platformAdmin,
} from '@test/non-functional/auth/my-privileges/common';
import { changePreferenceSpaceCodegen } from '@test/utils/mutations/preferences-mutation';
import { deleteOpportunityCodegen } from '../opportunity/opportunity.request.params';
import { deleteChallengeCodegen } from '../challenge/challenge.request.params';
import {
  createChallengeWithUsersCodegen,
  createOpportunityWithUsersCodegen,
  createOrgAndSpaceWithUsersCodegen,
} from '@test/utils/data-setup/entities';

import {
  SpacePreferenceType,
  SpaceVisibility,
} from '@test/generated/alkemio-schema';

const organizationName = 'space-org-name' + uniqueId;
const hostNameId = 'space-org-nameid' + uniqueId;
const spaceName = 'space-name' + uniqueId;
const spaceNameId = 'space-nameid' + uniqueId;
const opportunityName = 'space-opp';
const challengeName = 'space-chal';
let organizationIdTwo = '';
const organizationNameTwo = 'org2' + uniqueId;

describe('Update space platform settings', () => {
  beforeAll(async () => {
    await createOrgAndSpaceWithUsersCodegen(
      organizationName,
      hostNameId,
      spaceName,
      spaceNameId
    );
    await createChallengeWithUsersCodegen(challengeName);
    await createOpportunityWithUsersCodegen(opportunityName);
  });

  afterAll(async () => {
    await deleteOpportunityCodegen(entitiesId.opportunityId);
    await deleteChallengeCodegen(entitiesId.challengeId);
    await deleteSpaceCodegen(entitiesId.spaceId);
    await deleteOrganizationCodegen(entitiesId.organizationId);
  });

  describe('Update space settings - functional', () => {
    beforeAll(async () => {
      const orgData = await createOrganizationCodegen(
        organizationNameTwo,
        organizationNameTwo
      );
      organizationIdTwo = orgData?.data?.createOrganization.id ?? '';
    });

    afterAll(async () => {
      await updateSpaceVisibilityCodegen(
        entitiesId.spaceId,
        SpaceVisibility.Active,
        spaceNameId,
        organizationIdTwo
      );

      await deleteOrganizationCodegen(organizationIdTwo);
    });

    test('Update space settings', async () => {
      // Act
      await updateSpaceVisibilityCodegen(
        entitiesId.spaceId,
        SpaceVisibility.Demo,
        `demo-${uniqueId}`,
        organizationIdTwo
      );

      const spaceData = await getSpaceDataCodegen(entitiesId.spaceId);
      const spaceSettings = spaceData?.data?.space;

      // Assert

      expect(spaceSettings?.license.visibility).toEqual(SpaceVisibility.Demo);
      expect(spaceSettings?.host?.id).toEqual(organizationIdTwo);
      expect(spaceSettings?.nameID).toEqual(`demo-${uniqueId}`);
    });
  });

  describe('Authorization - Update space platform settings', () => {
    beforeAll(async () => {
      await updateSpaceVisibilityCodegen(
        entitiesId.spaceId,
        SpaceVisibility.Active
      );
    });
    describe('DDT role access to private Space', () => {
      // Arrange
      test.each`
        user                               | spaceMyPrivileges
        ${TestUser.GLOBAL_ADMIN}           | ${sorted__create_read_update_delete_grant_authorizationReset_createChallenge_platformAdmin}
        ${TestUser.GLOBAL_HUBS_ADMIN}      | ${sorted__create_read_update_delete_grant_authorizationReset_createChallenge_platformAdmin}
        ${TestUser.GLOBAL_COMMUNITY_ADMIN} | ${readPrivilege}
        ${TestUser.HUB_ADMIN}              | ${sorted__create_read_update_delete_grant_createChallenge}
        ${TestUser.HUB_MEMBER}             | ${readPrivilege}
        ${TestUser.NON_HUB_MEMBER}         | ${[]}
      `(
        'User: "$user", should have private Space privileges: "$spaceMyPrivileges"',
        async ({ user, spaceMyPrivileges }) => {
          const request = await getPrivateSpaceDataCodegen(
            entitiesId.spaceId,
            user
          );
          const result = request?.data?.space;

          // Assert
          expect(result?.authorization?.myPrivileges?.sort()).toEqual(
            spaceMyPrivileges
          );
        }
      );
    });

    describe('DDT role access to public Space', () => {
      // Arrange
      beforeAll(async () => {
        await updateSpaceVisibilityCodegen(
          entitiesId.spaceId,
          SpaceVisibility.Active
        );

        await changePreferenceSpaceCodegen(
          entitiesId.spaceId,
          SpacePreferenceType.AuthorizationAnonymousReadAccess,
          'true'
        );
      });

      test.each`
        user                               | spaceMyPrivileges
        ${TestUser.GLOBAL_ADMIN}           | ${sorted__create_read_update_delete_grant_authorizationReset_createChallenge_platformAdmin}
        ${TestUser.GLOBAL_HUBS_ADMIN}      | ${sorted__create_read_update_delete_grant_authorizationReset_createChallenge_platformAdmin}
        ${TestUser.GLOBAL_COMMUNITY_ADMIN} | ${readPrivilege}
        ${TestUser.HUB_ADMIN}              | ${sorted__create_read_update_delete_grant_createChallenge}
        ${TestUser.HUB_MEMBER}             | ${readPrivilege}
        ${TestUser.NON_HUB_MEMBER}         | ${readPrivilege}
      `(
        'User: "$user", should have private Space privileges: "$spaceMyPrivileges"',
        async ({ user, spaceMyPrivileges }) => {
          const request = await getPrivateSpaceDataCodegen(
            entitiesId.spaceId,
            user
          );
          const result = request?.data?.space;

          // Assert
          expect(result?.authorization?.myPrivileges?.sort()).toEqual(
            spaceMyPrivileges
          );
        }
      );
    });
  });

  describe('DDT role WITH access to public archived Space', () => {
    // Arrange
    beforeEach(async () => {
      await updateSpaceVisibilityCodegen(
        entitiesId.spaceId,
        SpaceVisibility.Active
      );
    });

    beforeAll(async () => {
      await changePreferenceSpaceCodegen(
        entitiesId.spaceId,
        SpacePreferenceType.AuthorizationAnonymousReadAccess,
        'true'
      );
    });

    test.each`
      user                               | email                         | communicationMyPrivileges                                                                   | challengesCount | opportunitiesCount
      ${TestUser.GLOBAL_ADMIN}           | ${'admin@alkem.io'}           | ${sorted__create_read_update_delete_grant_authorizationReset_createChallenge_platformAdmin} | ${1}            | ${1}
      ${TestUser.GLOBAL_HUBS_ADMIN}      | ${'global.spaces@alkem.io'}   | ${sorted__create_read_update_delete_grant_authorizationReset_createChallenge_platformAdmin} | ${1}            | ${1}
      ${TestUser.GLOBAL_COMMUNITY_ADMIN} | ${'community.admin@alkem.io'} | ${readPrivilege}                                                                            | ${1}            | ${1}
    `(
      'User role: "$user", have access to public archived Space',
      async ({
        user,
        email,
        communicationMyPrivileges,
        challengesCount,
        opportunitiesCount,
      }) => {
        // Arrange
        const getuserRoleSpaceDataBeforeArchive = await getUserRoleSpacesVisibilityCodegen(
          email,
          SpaceVisibility.Active
        );
        const beforeVisibilityChangeAllSpaces =
          getuserRoleSpaceDataBeforeArchive?.data?.rolesUser.spaces;
        const dataBeforeVisibilityChange = beforeVisibilityChangeAllSpaces?.filter(
          (obj: { nameID: string }) => {
            return obj.nameID.includes(spaceNameId);
          }
        );

        // Act
        await updateSpaceVisibilityCodegen(
          entitiesId.spaceId,
          SpaceVisibility.Archived
        );

        const getUserRoleSpaceDataAfterArchive = await getUserRoleSpacesVisibilityCodegen(
          email,
          SpaceVisibility.Archived
        );

        const afterVisibilityChangeAllSpaces =
          getUserRoleSpaceDataAfterArchive?.data?.rolesUser?.spaces;
        const dataAfterVisibilityChange = afterVisibilityChangeAllSpaces?.filter(
          (obj: { nameID: string }) => {
            return obj.nameID.includes(spaceNameId);
          }
        );

        const spaceDataAfterArchive = await getSpacesFilteredByVisibilityWithAccessCodegen(
          entitiesId.spaceId,
          user
        );
        const allSpaces = spaceDataAfterArchive?.data?.spaces;
        const data = allSpaces?.filter((obj: { nameID: string }) => {
          return obj.nameID.includes(spaceNameId);
        });

        // Assert
        expect(dataBeforeVisibilityChange).toEqual(dataAfterVisibilityChange);
        expect(data?.[0].license.visibility).toEqual(SpaceVisibility.Archived);
        expect(data?.[0].challenges).toHaveLength(challengesCount);
        expect(data?.[0].opportunities).toHaveLength(opportunitiesCount);
        expect(data?.[0].authorization?.myPrivileges?.sort()).toEqual(
          communicationMyPrivileges
        );
      }
    );
  });

  describe('DDT role WITHOUT access to public archived Space', () => {
    // Arrange
    beforeEach(async () => {
      await updateSpaceVisibilityCodegen(
        entitiesId.spaceId,
        SpaceVisibility.Active
      );
    });

    beforeAll(async () => {
      await changePreferenceSpaceCodegen(
        entitiesId.spaceId,
        SpacePreferenceType.AuthorizationAnonymousReadAccess,
        'true'
      );
    });

    test.each`
      user                       | email                      | communicationMyPrivileges | challengesCount | opportunitiesCount
      ${TestUser.HUB_ADMIN}      | ${'space.admin@alkem.io'}  | ${[]}                     | ${null}         | ${null}
      ${TestUser.HUB_MEMBER}     | ${'space.member@alkem.io'} | ${[]}                     | ${null}         | ${null}
      ${TestUser.NON_HUB_MEMBER} | ${'non.space@alkem.io'}    | ${[]}                     | ${null}         | ${null}
    `(
      'User role: "$user", have NO access to public archived Space',
      async ({ user, email, communicationMyPrivileges }) => {
        const getuserRoleSpaceDataBeforeArchive = await getUserRoleSpacesVisibilityCodegen(
          email,
          SpaceVisibility.Active
        );
        const beforeVisibilityChangeAllSpaces =
          getuserRoleSpaceDataBeforeArchive?.data?.rolesUser.spaces;
        const dataBeforeVisibilityChange = beforeVisibilityChangeAllSpaces?.filter(
          (obj: { nameID: string }) => {
            return obj.nameID.includes(spaceNameId);
          }
        );

        // Act
        await updateSpaceVisibilityCodegen(
          entitiesId.spaceId,
          SpaceVisibility.Archived
        );

        const getUserRoleSpaceDataAfterArchive = await getUserRoleSpacesVisibilityCodegen(
          email,
          SpaceVisibility.Archived
        );

        const afterVisibilityChangeAllSpaces =
          getUserRoleSpaceDataAfterArchive?.data?.rolesUser.spaces;
        const dataAfterVisibilityChange = afterVisibilityChangeAllSpaces?.filter(
          (obj: { nameID: string }) => {
            return obj.nameID.includes(spaceNameId);
          }
        );

        const spaceDataAfterArchive = await getSpacesFilteredByVisibilityNoAccessCodegen(
          entitiesId.spaceId,
          user
        );

        const allSpaces = spaceDataAfterArchive?.data?.spaces;
        const data = allSpaces?.filter((obj: { nameID: string }) => {
          return obj.nameID.includes(spaceNameId);
        });

        // Assert
        expect(dataBeforeVisibilityChange).toEqual(dataAfterVisibilityChange);
        expect(data?.[0].license.visibility).toEqual(SpaceVisibility.Archived);
        expect(data?.[0].authorization?.myPrivileges?.sort()).toEqual(
          communicationMyPrivileges
        );
      }
    );
  });
});