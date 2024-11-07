import { TestUser } from '@test/utils/token.helper';
import { getSpaceData } from '@test/functional-api/journey/space/space.request.params';
import { getGraphqlClient } from '@test/utils/graphqlClient';
import { graphqlErrorWrapper } from '@test/utils/graphql.wrapper';
import { TemplateType } from '@test/generated/alkemio-schema';

export const createPostTemplate = async (
  templatesSetID: string,
  defaultDescription = 'Default post template description',
  displayName = 'Default post template title',
  description = 'Default post template info description',
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.createTemplate(
      {
        type: TemplateType.Post,
        profile: {
          displayName,
          description,
        },
        templatesSetId: templatesSetID,
        postDefaultDescription: defaultDescription,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const updatePostTemplate = async (
  ID: string,

  displayName: string,
  description: string,
  postDefaultDescription: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.UpdatePostTemplate(
      {
        profile: {
          displayName,
          description,
        },
        templateId: ID,
        postDefaultDescription,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const getPostTemplatesCountForSpace = async (spaceId: string) => {
  const template = await getSpaceData(spaceId);
  const spacePostTemplates =
    template?.data?.space?.templatesManager?.templatesSet?.postTemplates ?? [];

  return spacePostTemplates.length;
};
