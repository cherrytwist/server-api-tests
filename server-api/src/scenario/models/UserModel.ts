import { TestUser } from '@alkemio/tests-lib';

export type UserModel = {
  id: string;
  nameId: string;
  email: string;
  displayName: string;
  profileId: string;
  agentId: string;
  accountId: string;
  authToken: string;
  type: TestUser;
  RoleNames: string[];
};