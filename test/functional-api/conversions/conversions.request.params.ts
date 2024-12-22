import { TestUser } from '@utils/test.user';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { getGraphqlClient } from '@utils/graphqlClient';

export const convertChallengeToSpace = async (
  subspaceID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.convertChallengeToSpace(
      {
        convertData: {
          subspaceID,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
