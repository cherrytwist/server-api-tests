/**
 * This file contains integration tests for managing organization owners within the platform.
 * It includes tests for creating organizations and assigning users as organization owners.
 * The tests cover scenarios such as:
 * - Creating an organization with specific details like name and host name ID.
 * - Assigning a user as the owner of an organization.
 * - Verifying that a user can be assigned as the owner of multiple organizations.
 * - Cleaning up by deleting the created organizations after tests.
 *
 * The tests ensure that the organization owner assignment process works as expected,
 * and that the API responses match the expected values.
 */
import '@utils/array.matcher';
import {
  createOrganization,
  deleteOrganization,
} from '../organization/organization.request.params';
import { TestUserManager } from '@src/scenario/TestUserManager';
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { TestScenarioNoPreCreationConfig } from '@src/scenario/config/test-scenario-config';
import { EmptyModel } from '@src/scenario/models/EmptyModel';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { assignRoleToUser, removeRoleFromUser } from '@functional-api/roleset/roles-request.params';
import { RoleName } from '@generated/alkemio-schema';
const uniqueId = UniqueIDGenerator.getID();

let organizationId = '';
let organizationRoleSetId = '';
const credentialsType = 'ORGANIZATION_OWNER';
const organizationName = 'org-auth-org-name' + uniqueId;
const hostNameId = 'org-auth-org-nameid' + uniqueId;
let responseData: object;

let baseScenario: EmptyModel;
const scenarioConfig: TestScenarioNoPreCreationConfig = {
  name: 'organization-owner',
};
beforeAll(async () => {
  baseScenario = await TestScenarioFactory.createBaseScenarioEmpty(scenarioConfig);
});
beforeEach(async () => {
  const request = await createOrganization(organizationName, hostNameId);
  organizationId = request.data?.createOrganization?.id ?? '';
  organizationRoleSetId = request.data?.createOrganization?.roleSet.id ?? '';

  responseData = {
    resourceID: organizationId,
    type: credentialsType,
  };
});

afterEach(async () => {
  await deleteOrganization(organizationId);
});

describe('Organization Owner', () => {
  test('should create organization owner', async () => {
    // Act

    const res = await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    // Assert
    expect(
      res?.data?.assignRoleToUser?.agent?.credentials
    ).toContainObject(responseData);
  });

  test('should add same user as owner of 2 organization', async () => {
    // Arrange
    const responseOrgTwo = await createOrganization(
      `OrgTwoOwnerOne-${uniqueId}`,
      `orgtwoownerone-${uniqueId}`
    );
    const org2Data = responseOrgTwo.data?.createOrganization;
    const organizationIdTwo = org2Data?.id ?? '';
    const organizationRoleSetIdTwo = org2Data?.roleSet.id ?? '';

    // Act
    const resOne = await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    const resTwo = await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetIdTwo,
      RoleName.Owner
    );

    // Assert
    expect(
      resOne?.data?.assignRoleToUser?.agent?.credentials
    ).toContainObject(responseData);
    expect(
      resTwo?.data?.assignRoleToUser?.agent?.credentials
    ).toContainObject({
      resourceID: organizationIdTwo,
      type: credentialsType,
    });

    await deleteOrganization(organizationIdTwo);
  });

  test('should remove user owner from organization', async () => {
    // Arrange
    await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    await assignRoleToUser(
      TestUserManager.users.nonSpaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    // Act
    const res = await removeRoleFromUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    // Assert
    expect(
      res?.data?.removeRoleFromUser?.agent?.credentials
    ).not.toContainObject(responseData);
  });

  test('should not remove the only owner of an organization', async () => {
    // Arrange
    await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    // Act
    const res = await removeRoleFromUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    // Assert
    expect(res?.error?.errors[0].message).toContain(
      `Not allowed to remove last owner for Organization: ${organizationId}`
    );
  });

  test('should not return user credentials for removing user not owner of an Organization', async () => {
    // Act
    const res = await removeRoleFromUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    // Assert
    expect(
      res?.data?.removeRoleFromUser?.agent?.credentials
    ).not.toContainObject(responseData);
  });

  test('should throw error for assigning same organization owner twice', async () => {
    // Arrange
    await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );

    // Act
    const res = await assignRoleToUser(
      TestUserManager.users.spaceMember.id,
      organizationRoleSetId,
      RoleName.Owner
    );
    // Assert
    expect(res?.error?.errors[0].message).toEqual(
      `Agent (${TestUserManager.users.spaceMember.agentId}) already has assigned credential: organization-owner`
    );
  });
});
