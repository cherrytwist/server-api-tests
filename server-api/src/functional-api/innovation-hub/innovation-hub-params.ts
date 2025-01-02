import {
  InnovationHubType,
  SpaceVisibility,
} from '@generated/alkemio-schema';
import { TestUser } from '@alkemio/tests-lib';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { getGraphqlClient } from '@utils/graphqlClient';

export const createInnovationHub = async (
  accountID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.CreateInnovationHub(
      {
        input: {
          accountID,
          subdomain: 'demo',
          type: InnovationHubType.Visibility,
          nameID: 'demo',
          profileData: {
            displayName: 'demo space',
          },
          spaceVisibilityFilter: SpaceVisibility.Demo,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const deleteInnovationHub = async (
  ID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.DeleteInnovationHub(
      {
        input: {
          ID,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
