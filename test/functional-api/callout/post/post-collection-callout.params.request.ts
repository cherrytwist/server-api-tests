import { CalloutType, CalloutVisibility } from '@test/generated/alkemio-schema';
import { TestUser } from '@test/utils';
import { graphqlErrorWrapper } from '@test/utils/graphql.wrapper';
import { getGraphqlClient } from '@test/utils/graphqlClient';

export const createPostCollectionCalloutCodegen = async (
  collaborationID: string,
  nameID: string,
  displayName: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.CreateCalloutOnCollaboration(
      {
        calloutData: {
          collaborationID,
          nameID,
          type: CalloutType.PostCollection,

          visibility: CalloutVisibility.Published,
          framing: {
            profile: {
              displayName,
              description: 'Post collection callout',
            },
          },
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const createPostCardOnCalloutCodegen = async (
  calloutID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.CreateContributionOnCallout(
      {
        contributionData: {
          calloutID,
          post: {
            profileData: {
              displayName: '111',
              description: 'Create Call for Posts\n',
            },
            type: '',
          },
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};