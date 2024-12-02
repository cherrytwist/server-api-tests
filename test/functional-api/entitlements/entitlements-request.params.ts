import { TestUser } from '../../utils';
import { graphqlErrorWrapper } from '../../utils/graphql.wrapper';
import { getGraphqlClient } from '../../utils/graphqlClient';

export const getMyEntitlementsQuery = async (
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.MyEntitlementsQuery(
      {},
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const getOrganazationEntitlementsQuery = async (
  organizationId: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.OrganizationEntitlementsQuery(
      { ID: organizationId },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
