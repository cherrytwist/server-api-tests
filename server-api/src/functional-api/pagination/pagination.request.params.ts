import { TestUser } from '@alkemio/tests-lib';
import { getGraphqlClient } from '@utils/graphqlClient';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { OrganizationFilterInput, UserFilterInput } from '@generated/graphql';

export const paginatedUser = async (
  options: {
    first?: number | undefined;
    last?: number | undefined;
    before?: string | undefined;
    after?: string | undefined;
    filter?: UserFilterInput | undefined;
  },
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.UsersPaginated(
      {
        ...options,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );
  return graphqlErrorWrapper(callback, userRole);
};

export const paginatedOrganization = async (
  options: {
    first?: number | undefined;
    last?: number | undefined;
    before?: string | undefined;
    after?: string | undefined;
    filter?: OrganizationFilterInput | undefined;
  },
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.OrganizationsPaginated(
      {
        ...options,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );
  return graphqlErrorWrapper(callback, userRole);
};
