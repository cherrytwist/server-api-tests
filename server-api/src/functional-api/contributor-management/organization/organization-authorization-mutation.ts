import { TestUser } from '@alkemio/tests-lib';
import { getGraphqlClient } from '@utils/graphqlClient';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { RoleName } from '@generated/alkemio-schema';

export const grantCredentialToUserVariablesData = (
  userID: string,
  type: string,
  resourceID?: string
) => {
  const variables = {
    grantCredentialData: {
      userID,
      type,
      resourceID,
    },
  };
  const responseData = JSON.stringify(variables);
  return responseData;
};

export const revokeCredentialFromUserVariablesData = (
  userID: string,
  type: string,
  resourceID?: string
) => {
  const variables = {
    revokeCredentialData: {
      userID,
      type,
      resourceID,
    },
  };
  const responseData = JSON.stringify(variables);
  return responseData;
};

export const assignUserAsOrganizationOwner = async (
  userID: string,
  roleSetID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.AssignRoleToUserExtendedData(
      {
        roleData: {
          contributorID: userID,
          roleSetID,
          role: RoleName.Owner,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const assignUserAsOrganizationAdmin = async (
  contributorID: string,
  roleSetID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.AssignRoleToUserExtendedData(
      {
        roleData: {
          contributorID,
          roleSetID,
          role: RoleName.Admin,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const removeUserAsOrganizationOwner = async (
  contributorID: string,
  roleSetID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.RemoveRoleFromUserExtendedData(
      {
        roleData: {
          contributorID,
          roleSetID,
          role: RoleName.Owner,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
