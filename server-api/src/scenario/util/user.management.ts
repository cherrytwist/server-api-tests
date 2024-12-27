import { TestUser } from "@alkemio/tests-lib";
import { graphqlErrorWrapper } from "@utils/graphql.wrapper";
import { getGraphqlClient } from "@utils/graphqlClient";

export const getUserData = async (
  userId: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.getUserData(
      {
        userId,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );
  return graphqlErrorWrapper(callback, userRole);
};