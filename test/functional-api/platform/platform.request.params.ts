import { TestUser } from '@utils';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
import { getGraphqlClient } from '@utils/graphqlClient';
import { SpaceVisibility } from '../../generated/alkemio-schema';

export const updateSpacePlatformSettings = async (
  spaceID: string,
  visibility?: SpaceVisibility,
  nameID?: string,
  hostID?: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.UpdateSpacePlatformSettings(
      {
        spaceID,
        visibility,
        nameID,
        hostID,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
