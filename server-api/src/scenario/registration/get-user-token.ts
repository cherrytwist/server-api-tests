import { AlkemioClient } from '@alkemio/client-lib';
import { testConfiguration } from '@src/config/test.configuration';


export const getUserToken = async (userEmail: string) => {
  const server = testConfiguration.endPoints.graphql.private;

  if (!server) {
    throw new Error('server url not provided');
  }

  const alkemioClientConfig = {
    apiEndpointPrivateGraphql: server,
    authInfo: {
      credentials: {
        email: userEmail,
        password: testConfiguration.identities.admin.password,
      },
    },
  };

  const alkemioClient = new AlkemioClient(alkemioClientConfig);
  await alkemioClient.enableAuthentication();

  return alkemioClient.apiToken;
};
