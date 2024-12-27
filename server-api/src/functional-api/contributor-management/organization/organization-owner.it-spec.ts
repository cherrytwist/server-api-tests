import '@utils/array.matcher';
import {
  createOrganization,
  deleteOrganization,
} from '../organization/organization.request.params';
import { TestUserManager } from '@src/scenario/test.user.manager';
import { assignUserAsOrganizationOwner, removeUserAsOrganizationOwner } from './organization-authorization-mutation';
import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();

let organizationId = '';
const credentialsType = 'ORGANIZATION_OWNER';
const organizationName = 'org-auth-org-name' + uniqueId;
const hostNameId = 'org-auth-org-nameid' + uniqueId;

// eslint-disable-next-line @typescript-eslint/ban-types
let responseData: object;

beforeEach(async () => {
  const baseScenario = await createOrganization(organizationName, hostNameId);
  organizationId = baseScenario.data?.createOrganization?.id ?? '';

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

    const res = await assignUserAsOrganizationOwner(
      TestUserManager.users.spaceMember.id,
      organizationId
    );

    // Assert
    expect(
      res?.data?.assignOrganizationRoleToUser?.agent?.credentials
    ).toContainObject(responseData);
  });

  test('should add same user as owner of 2 organization', async () => {
    // Arrange
    const responseOrgTwo = await createOrganization(
      `OrgTwoOwnerOne-${uniqueId}`,
      `orgtwoownerone-${uniqueId}`
    );
    const organizationIdTwo = responseOrgTwo.data?.createOrganization?.id ?? '';

    // Act
    const resOne = await assignUserAsOrganizationOwner(
      TestUserManager.users.spaceMember.id,
      organizationId
    );

    const resTwo = await assignUserAsOrganizationOwner(
      TestUserManager.users.spaceMember.id,
      organizationIdTwo
    );

    // Assert
    expect(
      resOne?.data?.assignOrganizationRoleToUser?.agent?.credentials
    ).toContainObject(responseData);
    expect(
      resTwo?.data?.assignOrganizationRoleToUser?.agent?.credentials
    ).toContainObject({
      resourceID: organizationIdTwo,
      type: credentialsType,
    });

    await deleteOrganization(organizationIdTwo);
  });

  test('should remove user owner from organization', async () => {
    // Arrange
    await assignUserAsOrganizationOwner(TestUserManager.users.spaceMember.id, organizationId);

    await assignUserAsOrganizationOwner(
      TestUserManager.users.nonSpaceMember.id,
      organizationId
    );

    // Act
    const res = await removeUserAsOrganizationOwner(
      TestUserManager.users.spaceMember.id,
      organizationId
    );

    // Assert
    expect(
      res?.data?.removeOrganizationRoleFromUser?.agent?.credentials
    ).not.toContainObject(responseData);
  });

  test('should not remove the only owner of an organization', async () => {
    // Arrange
    await assignUserAsOrganizationOwner(TestUserManager.users.spaceMember.id, organizationId);

    // Act
    const res = await removeUserAsOrganizationOwner(
      TestUserManager.users.spaceMember.id,
      organizationId
    );

    // Assert
    expect(res?.error?.errors[0].message).toContain(
      `Not allowed to remove last owner for Organization: ${organizationId}`
    );
  });

  test('should not return user credentials for removing user not owner of an Organization', async () => {
    // Act
    const res = await removeUserAsOrganizationOwner(
      TestUserManager.users.spaceMember.id,
      organizationId
    );

    // Assert
    expect(
      res?.data?.removeOrganizationRoleFromUser?.agent?.credentials
    ).not.toContainObject(responseData);
  });

  test('should throw error for assigning same organization owner twice', async () => {
    // Arrange
    await assignUserAsOrganizationOwner(TestUserManager.users.spaceMember.id, organizationId);

    // Act
    const res = await assignUserAsOrganizationOwner(
      TestUserManager.users.spaceMember.id,
      organizationId
    );
    // Assert
    expect(res?.error?.errors[0].message).toEqual(
      `Agent (${TestUserManager.users.spaceMember.agentId}) already has assigned credential: organization-owner`
    );
  });
});
