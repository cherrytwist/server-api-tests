import { TestUser } from '@alkemio/tests-lib';
import { SpaceVisibility } from '@generated/graphql';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { getGraphqlClient } from '@utils/graphqlClient';

export const updateSpacePlatformSettings = async (
  spaceID: string,
  visibility: SpaceVisibility,
  nameID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.UpdateSpacePlatformSettings(
      {
        spaceId: spaceID,
        visibility,
        nameId: nameID,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
