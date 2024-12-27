import { updateOrganization } from './organization.request.params';
import { updateOrganizationSettings } from './organization.request.params';
import { TestUser } from '@alkemio/tests-lib';
import { assignUserAsOrganizationOwner } from './organization-authorization-mutation';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
import { TestUserManager } from '@src/scenario/TestUserManager';

const domain = 'alkem.io';

let baseScenario: OrganizationWithSpaceModel;
// Note: no space, just the org to make this test suite much faster
const scenarioConfig: TestScenarioConfig = {
  name: 'organization-settings',
};

beforeAll(async () => {
  baseScenario = await TestScenarioFactory.createBaseScenario(scenarioConfig);

  await updateOrganization(baseScenario.organization.id, {
    domain: domain,
    website: domain,
  });

  await assignUserAsOrganizationOwner(
    TestUserManager.users.spaceMember.id,
    baseScenario.organization.id
  );

  await assignUserAsOrganizationOwner(
    TestUserManager.users.spaceAdmin.id,
    baseScenario.organization.id
  );
});

afterAll(async () => {
  //await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Organization settings', () => {
  describe('DDT user WITH privileges to update organization settings', () => {
    // Arrange
    test.each`
      userRole                 | message
      ${TestUser.GLOBAL_ADMIN} | ${'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN'}
      ${TestUser.SPACE_ADMIN}  | ${'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN'}
      ${TestUser.SPACE_MEMBER} | ${'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN'}
    `(
      'User: "$userRole" get message: "$message", when intend to update organization settings ',
      async ({ userRole, message }) => {
        // Act
        const res = await updateOrganizationSettings(
          baseScenario.organization.id,
          {
            membership: {
              allowUsersMatchingDomainToJoin: false,
            },
          },
          userRole
        );

        // Assert
        expect(
          res?.data?.updateOrganizationSettings.settings.membership
            .allowUsersMatchingDomainToJoin
        ).toEqual(true);
      }
    );
  });

  // describe('DDT user WITHOUT privileges to update organization settings', () => {
  //   // Arrange
  //   test.each`
  //     userRole                     | message
  //     ${TestUser.NON_SPACE_MEMBER} | ${"Authorization: unable to grant 'update' privilege: organization settings update:"}
  //   `(
  //     'User: "$userRole" get message: "$message", when intend to update organization settings ',
  //     async ({ userRole, message }) => {
  //       // Act
  //       const res = await updateOrganizationSettings(
  //         baseScenario.organization.id,
  //         {
  //           membership: {
  //             allowUsersMatchingDomainToJoin: false,
  //           },
  //         },
  //         userRole
  //       );

  //       // Assert
  //       expect(res?.error?.errors[0].message).toContain(message);
  //     }
  //   );
  // });

  //   describe('Unverified organization - domain match', () => {
  //     afterEach(async () => {
  //       await deleteUser(userId);
  //     });
  //     test("don't assign new user to organization,domain setting enabled", async () => {
  //       // Arrange
  //       await updateOrganizationSettings(baseScenario.organization.id, {
  //         membership: {
  //           allowUsersMatchingDomainToJoin: true,
  //         },
  //       });

  //       // Act
  //       const email = `enm${uniqueId}@${domain}`;
  //       userId = await registerVerifiedUser(email, firstName, lastName);

  //       const organizationData = await getOrganizationData(
  //         baseScenario.organization.id
  //       );
  //       const organizationMembers =
  //         organizationData?.data?.organization.associates;

  //       // Assert
  //       expect(organizationMembers).toHaveLength(1);
  //       expect(organizationMembers).not.toEqual(
  //         expect.arrayContaining([
  //           expect.objectContaining({
  //             email: email,
  //           }),
  //         ])
  //       );
  //     });

  //     test("don't assign new user to organization, domain setting disabled", async () => {
  //       // Arrange
  //       await updateOrganizationSettings(baseScenario.organization.id, {
  //         membership: {
  //           allowUsersMatchingDomainToJoin: false,
  //         },
  //       });

  //       // Act
  //       const email = `dism${uniqueId}@${domain}`;
  //       userId = await registerVerifiedUser(email, firstName, lastName);

  //       const organizationData = await getOrganizationData(
  //         baseScenario.organization.id
  //       );
  //       const organizationMembers =
  //         organizationData?.data?.organization.associates;

  //       // Assert
  //       expect(organizationMembers).toHaveLength(1);
  //       expect(organizationMembers).not.toEqual(
  //         expect.arrayContaining([
  //           expect.objectContaining({
  //             email: email,
  //           }),
  //         ])
  //       );
  //     });

  //     test("don't assign new user with different domain to organization,domain setting enabled", async () => {
  //       // Arrange
  //       await updateOrganizationSettings(baseScenario.organization.id, {
  //         membership: {
  //           allowUsersMatchingDomainToJoin: true,
  //         },
  //       });

  //       // Act
  //       const email = `enms${uniqueId}@a${domain}`;
  //       userId = await registerVerifiedUser(email, firstName, lastName);

  //       const organizationData = await getOrganizationData(
  //         baseScenario.organization.id
  //       );
  //       const organizationMembers =
  //         organizationData?.data?.organization.associates;

  //       // Assert

  //       expect(organizationMembers).toHaveLength(1);
  //       expect(organizationMembers).not.toEqual(
  //         expect.arrayContaining([
  //           expect.objectContaining({
  //             email: email,
  //           }),
  //         ])
  //       );
  //     });
  //   });

  //   describe('Verified organization - domain match', () => {
  //     beforeAll(async () => {
  //       await eventOnOrganizationVerification(
  //         baseScenario.organization.verificationId,
  //         'VERIFICATION_REQUEST'
  //       );

  //       await eventOnOrganizationVerification(
  //         baseScenario.organization.verificationId,
  //         'MANUALLY_VERIFY'
  //       );
  //     });

  //     afterEach(async () => {
  //       await deleteUser(userId);
  //     });
  //     test('assign new user to organization,domain setting enabled', async () => {
  //       // Arrange
  //       await updateOrganizationSettings(baseScenario.organization.id, {
  //         membership: {
  //           allowUsersMatchingDomainToJoin: true,
  //         },
  //       });

  //       // Act
  //       const email = `en${uniqueId}@${domain}`;
  //       userId = await registerVerifiedUser(email, firstName, lastName);

  //       const organizationData = await getOrganizationData(
  //         baseScenario.organization.id
  //       );
  //       const organizationMembers =
  //         organizationData?.data?.organization.associates;

  //       // Assert
  //       expect(organizationMembers).toHaveLength(2);
  //       expect(organizationMembers).toEqual(
  //         expect.arrayContaining([
  //           expect.objectContaining({
  //             email: email,
  //           }),
  //         ])
  //       );
  //     });

  //     test("don't assign new user to organization, domain setting disabled", async () => {
  //       // Arrange
  //       await updateOrganizationSettings(baseScenario.organization.id, {
  //         membership: {
  //           allowUsersMatchingDomainToJoin: false,
  //         },
  //       });

  //       // Act
  //       const email = `dis${uniqueId}@${domain}`;
  //       userId = await registerVerifiedUser(email, firstName, lastName);

  //       const organizationData = await getOrganizationData(
  //         baseScenario.organization.id
  //       );
  //       const organizationMembers =
  //         organizationData?.data?.organization.associates;

  //       // Assert
  //       expect(organizationMembers).toHaveLength(1);
  //       expect(organizationMembers).not.toEqual(
  //         expect.arrayContaining([
  //           expect.objectContaining({
  //             email: email,
  //           }),
  //         ])
  //       );
  //     });

  //     test("don't assign new user with different domain to organization,domain setting enabled", async () => {
  //       // Arrange
  //       await updateOrganizationSettings(baseScenario.organization.id, {
  //         membership: {
  //           allowUsersMatchingDomainToJoin: true,
  //         },
  //       });

  //       // Act
  //       const email = `en${uniqueId}@a${domain}`;
  //       userId = await registerVerifiedUser(email, firstName, lastName);

  //       const organizationData = await getOrganizationData(
  //         baseScenario.organization.id
  //       );
  //       const organizationMembers =
  //         organizationData?.data?.organization.associates;

  //       // Assert

  //       expect(organizationMembers).toHaveLength(1);
  //       expect(organizationMembers).not.toEqual(
  //         expect.arrayContaining([
  //           expect.objectContaining({
  //             email: email,
  //           }),
  //         ])
  //       );
  //     });
  //   });
});
