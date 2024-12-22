
import { PreferenceType } from '@generated/graphql';
import { graphqlErrorWrapper } from '../../../utils/graphql.wrapper';
import { getGraphqlClient } from '../../../utils/graphqlClient';
import { TestUser } from '@utils/test.user';


export const changePreferenceUser = async (
  userID: string,
  type: PreferenceType = PreferenceType.NotificationUserSignUp,
  value: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.UpdatePreferenceOnUser(
      {
        preferenceData: {
          userID,
          type,
          value,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
