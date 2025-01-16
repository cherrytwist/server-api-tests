import { TestUser } from '@alkemio/tests-lib';
import { RoleName } from '@generated/graphql';
import { graphqlRequestAuth } from '@utils/graphql.request';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { getGraphqlClient } from '@utils/graphqlClient';

export const assignPlatformRoleToUser = async (
  contributorID: string,
  roleName: RoleName,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.assignRoleNameToUser(
      {
        input: { contributorID, role: roleName },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const removePlatformRoleFromUser = async (
  contributorID: string,
  roleName: RoleName,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.removeRoleNameFromUser(
      {
        input: { contributorID, role: roleName },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};


export const authorizationPolicyResetOnPlatform = async (
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const requestParams = {
    operationName: null,
    query: `mutation authorizationPolicyResetOnPlatform {
      authorizationPolicyResetOnPlatform {
        id
      }
    }`,
    variables: null,
  };

  return await graphqlRequestAuth(requestParams, userRole);
};
