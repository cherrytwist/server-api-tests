import { getSdk } from '@generated/graphql';
import { testConfiguration } from '@src/config/test.configuration';
import { GraphQLClient } from 'graphql-request';

const graphqlClient = new GraphQLClient(testConfiguration.endPoints.graphql.private);
const graphqlSdkClient = getSdk(graphqlClient);

export const getGraphqlClient = () => {
  return graphqlSdkClient;
};
