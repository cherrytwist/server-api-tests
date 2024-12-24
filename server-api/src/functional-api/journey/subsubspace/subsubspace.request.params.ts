import { uniqueId } from '@utils/uniqueId';
import { TestUser } from '@alkemio/tests-lib';
import { getGraphqlClient } from '@utils/graphqlClient';
import { graphqlErrorWrapper } from '@utils/graphql.wrapper';
export const subsubspaceNameId = `oppNaId${uniqueId}`;

export const createSubsubspace = async (
  subsubspaceName: string,
  subsubspaceNameId: string,
  subspaceID: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.CreateSubspace(
      {
        subspaceData: {
          spaceID: subspaceID,
          nameID: subsubspaceNameId,
          profileData: {
            displayName: subsubspaceName,
          },
          collaborationData: {
            addTutorialCallouts: true,
          },
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const updateSubsubspace = async (
  subsubspaceId: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.updateSpace(
      {
        spaceData: subsubspaceVariablesData(subsubspaceId),
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const subsubspaceVariablesData = (subsubspaceId: string) => {
  const variables = {
    ID: subsubspaceId,
    profileData: {
      displayName: 'Updated displayName',
      tagline: 'updated tagline' + uniqueId,
      description: 'updated description' + uniqueId,
    },
    context: {
      vision: 'updated vision' + uniqueId,
      impact: 'updated impact' + uniqueId,
      who: 'updated who' + uniqueId,
    },
  };

  return variables;
};

export const deleteSubspace = async (subspaceId: string) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.deleteSpace(
      {
        deleteData: {
          ID: subspaceId,
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, TestUser.GLOBAL_ADMIN);
};

export const getSubsubspaceData = async (
  subsubspaceId: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.GetSpaceData(
      {
        spaceId: subsubspaceId,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};

export const updateSubsubspaceLocation = async (
  subsubspaceId: string,
  country?: string,
  city?: string,
  userRole: TestUser = TestUser.GLOBAL_ADMIN
) => {
  const graphqlClient = await getGraphqlClient();
  const callback = (authToken: string | undefined) =>
    graphqlClient.updateSpace(
      {
        spaceData: {
          ID: subsubspaceId,
          profileData: { location: { country, city } },
        },
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );

  return graphqlErrorWrapper(callback, userRole);
};
