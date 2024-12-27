import { testConfiguration } from '@src/config/test.configuration';
import { UserModel } from './models/UserModel';
import { AlkemioClient } from '@alkemio/client-lib';
import { TestUser } from '@alkemio/tests-lib';
import { TestUserModels } from './models/TestUserModels';
import { getGraphqlClient } from '@utils/graphqlClient';

export class TestUserManager {
  private static userModelMapEmail: Map<string, UserModel>;
  private static userModelMapType: Map<string, UserModel>;

  public static users: TestUserModels;

  public static async populateUserModelMap() {
    this.userModelMapEmail = new Map<string, UserModel>();
    this.userModelMapType = new Map<string, UserModel>();

    for (const user of Object.keys(TestUser)) {
      const userValue = TestUser[user as keyof typeof TestUser];
      // Create a user model for each test user
      const email = this.buildIdentifier(userValue);
      const userModel = this.createUserModel(email, userValue);

      // Populate the authentication token for each user
      await this.populateUserAuthenticationToken(userModel);

      // Populate the user model with details from the api
      await this.populateUserModelFromApi(userModel);

      this.userModelMapEmail.set(userModel.email, userModel);
      this.userModelMapType.set(userModel.type, userModel);
    }
    // Finally ensure the exposed users field is populated
    this.populateUsers();
  }

  private static createUserModel(email: string, testUser: TestUser): UserModel {
    const result: UserModel = {
      email,
      id: '',
      displayName: '',
      profileId: '',
      nameId: '',
      agentId: '',
      accountId: '',
      authToken: '',
      type: testUser,
    };
    return result;
  }

  private static populateUsers() {
    this.users = {
      globalAdmin: TestUserManager.getUserModelByEmail('admin@alkem.io'),
      globalSupportAdmin: TestUserManager.getUserModelByEmail(
        'global.support@alkem.io'
      ),
      globalLicenseAdmin: TestUserManager.getUserModelByEmail(
        'global.license@alkem.io'
      ),
      spaceAdmin: TestUserManager.getUserModelByEmail('space.admin@alkem.io'),
      spaceMember: TestUserManager.getUserModelByEmail('space.member@alkem.io'),
      subspaceAdmin: TestUserManager.getUserModelByEmail(
        'subspace.admin@alkem.io'
      ),
      subspaceMember: TestUserManager.getUserModelByEmail(
        'subspace.member@alkem.io'
      ),
      subsubspaceAdmin: TestUserManager.getUserModelByEmail(
        'subsubspace.admin@alkem.io'
      ),
      subsubspaceMember: TestUserManager.getUserModelByEmail(
        'subsubspace.member@alkem.io'
      ),
      qaUser: TestUserManager.getUserModelByEmail('qa.user@alkem.io'),
      notificationsAdmin: TestUserManager.getUserModelByEmail(
        'notifications@alkem.io'
      ),
      nonSpaceMember: TestUserManager.getUserModelByEmail('non.space@alkem.io'),
      betaTester: TestUserManager.getUserModelByEmail('beta.tester@alkem.io'),
    };
  }

  public static getUserModelByEmail(userEmail: string): UserModel {
    const userModel = this.userModelMapEmail.get(userEmail);
    if (!userModel) {
      throw new Error(`UserModel with email ${userEmail} not found`);
    }
    return userModel;
  }

  public static getUserModelByType(userType: TestUser): UserModel {
    const userModel = this.userModelMapType.get(userType);
    if (!userModel) {
      throw new Error(`UserModel with type ${userType} not found`);
    }
    return userModel;
  }

  private static async populateUserModelFromApi(
    userModel: UserModel
  ): Promise<void> {
    const userData = await this.getUserData(
      userModel.email,
      userModel.authToken
    );
    userModel.displayName = userData?.data?.user.profile.displayName || '';
    userModel.id = userData?.data?.user.id || '';
    userModel.profileId = userData?.data?.user.profile.id || '';
    userModel.nameId = userData?.data?.user.nameID || '';
    userModel.agentId = userData?.data?.user.agent.id || '';
    userModel.accountId = userData?.data?.user?.account?.id || '';
  }

  private static async getUserData(email: string, authToken: string) {
    const graphqlClient = getGraphqlClient();
    const result = graphqlClient.getUserData(
      {
        userId: email,
      },
      {
        authorization: `Bearer ${authToken}`,
      }
    );
    return result;
  }

  /**
   * Builds a map with access tokens for each user in the TestUser enum.
   * Uses ROPC client flow to authenticate the TestUserManager.users.
   *
   * @api public
   * @returns Returns a map in the form of <username, access_token>.
   */
  private static async populateUserAuthenticationToken(
    userModel: UserModel
  ): Promise<void> {
    const password = testConfiguration.identities.admin.password;

    const alkemioClientConfig = {
      apiEndpointPrivateGraphql: testConfiguration.endPoints.graphql.private,
      authInfo: {
        credentials: {
          email: userModel.email,
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
        `identifier: ${userModel.email} password: ${password}`
      );
    }
    userModel.authToken = alkemioClient.apiToken;
  }

  private static buildIdentifier(user: string) {
    const userUpn = `${user}@alkem.io`;

    return userUpn;
  }
}
