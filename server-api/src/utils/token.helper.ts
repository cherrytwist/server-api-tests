import { AlkemioClient } from '@alkemio/client-lib';
import { TestUser } from '@alkemio/tests-lib';
import { testConfiguration } from '@src/config/test.configuration';

export class TokenHelper {
  private users = Object.values(TestUser);

  private buildIdentifier(user: string) {
    const userUpn = `${user}@alkem.io`;

    return userUpn;
  }

  /**
   * Builds a map with access tokens for each user in the TestUser enum.
   * Uses ROPC client flow to authenticate the users.
   *
   * @api public
   * @returns Returns a map in the form of <username, access_token>.
   */
  async buildUserTokenMap() {
    const userTokenMap: Map<string, string> = new Map<string, string>();
    const password = testConfiguration.identities.admin.password;

    for (const user of this.users) {
      const identifier = this.buildIdentifier(user);
      const alkemioClientConfig = {
        apiEndpointPrivateGraphql: testConfiguration.endPoints.graphql.private,
        authInfo: {
          credentials: {
            email: identifier,
            password: password,
          },
        },
      };

      const alkemioClient = new AlkemioClient(alkemioClientConfig);
      try {
        await alkemioClient.enableAuthentication();
      } catch (e) {
        console.error(
          (e as Error).message,
          `identifier: ${identifier} password: ${password}`
        );
      }

      userTokenMap.set(user, alkemioClient.apiToken);
    }

    return userTokenMap;
  }
}