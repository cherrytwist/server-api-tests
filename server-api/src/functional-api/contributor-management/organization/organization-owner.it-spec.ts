import '@utils/array.matcher';
import {
  createOrganization,
  deleteOrganization,
} from '../organization/organization.request.params';
import { users } from '@utils/queries/users-data';
import { assignUserAsOrganizationOwner, removeUserAsOrganizationOwner } from './organization-authorization-mutation';
import { uniqueId } from '@utils/uniqueId';

let organizationId = '';
const credentialsType = 'ORGANIZATION_OWNER';
const organizationName = 'org-auth-org-name' + uniqueId;
const hostNameId = 'org-auth-org-nameid' + uniqueId;

// eslint-disable-next-line @typescript-eslint/ban-types
let responseData: object;

beforeEach(async () => {
  const responseOrg = await createOrganization(organizationName, hostNameId);
  organizationId = responseOrg.data?.createOrganization?.id ?? '';

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
      users.spaceMember.id,
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
      users.spaceMember.id,
      organizationId
    );

    const resTwo = await assignUserAsOrganizationOwner(
      users.spaceMember.id,
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
    await assignUserAsOrganizationOwner(users.spaceMember.id, organizationId);

    await assignUserAsOrganizationOwner(
      users.nonSpaceMember.id,
      organizationId
    );

    // Act
    const res = await removeUserAsOrganizationOwner(
      users.spaceMember.id,
      organizationId
    );

    // Assert
    expect(
      res?.data?.removeOrganizationRoleFromUser?.agent?.credentials
    ).not.toContainObject(responseData);
  });

  test('should not remove the only owner of an organization', async () => {
    // Arrange
    await assignUserAsOrganizationOwner(users.spaceMember.id, organizationId);

    // Act
    const res = await removeUserAsOrganizationOwner(
      users.spaceMember.id,
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
      users.spaceMember.id,
      organizationId
    );

    // Assert
    expect(
      res?.data?.removeOrganizationRoleFromUser?.agent?.credentials
    ).not.toContainObject(responseData);
  });

  test('should throw error for assigning same organization owner twice', async () => {
    // Arrange
    await assignUserAsOrganizationOwner(users.spaceMember.id, organizationId);

    // Act
    const res = await assignUserAsOrganizationOwner(
      users.spaceMember.id,
      organizationId
    );
    // Assert
    expect(res?.error?.errors[0].message).toEqual(
      `Agent (${users.spaceMember.agentId}) already has assigned credential: organization-owner`
    );
  });
});
