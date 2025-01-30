import { TestUser } from '@alkemio/tests-lib';
import { RoleName } from '@generated/graphql';
import { graphqlRequestAuth } from '@utils/graphql.request';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { getGraphqlClient } from '@utils/graphqlClient';

export const assignPlatformRole = async (
  contributorID: string,
  roleName: RoleName,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.assignPlatformRoleToUser(
      {
        roleData: { contributorID, role: roleName },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const removePlatformRole = async (
  contributorID: string,
  roleName: RoleName,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.removePlatformRoleFromUser(
      {
        roleData: { contributorID, role: roleName },
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
