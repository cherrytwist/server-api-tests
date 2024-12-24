import { TestUser } from '@alkemio/tests-lib';

import { getUserData } from '@functional-api/contributor-management/user/user.request.params';
import { assignPlatformRoleToUser, assignUserAsGlobalCommunityAdmin, assignUserAsGlobalSupport } from '@functional-api/platform/authorization-platform-mutation';
import { PlatformRole } from '@generated/graphql';

interface UserData {
  email: string;
  id: string;
  displayName: string;
  profileId: string;
  nameId: string;
  agentId: string;
  accountId: string;
}

interface Users {
  globalAdmin: UserData;
  globalSupportAdmin: UserData;
  globalLicenseAdmin: UserData;
  spaceAdmin: UserData;
  spaceMember: UserData;
  subspaceAdmin: UserData;
  subspaceMember: UserData;
  subsubspaceAdmin: UserData;
  subsubspaceMember: UserData;
  qaUser: UserData;
  notificationsAdmin: UserData;
  nonSpaceMember: UserData;
  betaTester: UserData;
}

const createUserData = (email: string): UserData => ({
  email,
  id: '',
  displayName: '',
  profileId: '',
  nameId: '',
  agentId: '',
  accountId: '',
});

const usersSetEmail: UserData[] = [
  createUserData('admin@alkem.io'),
  createUserData('global.support@alkem.io'),
  createUserData('global.license@alkem.io'),
  createUserData('space.admin@alkem.io'),
  createUserData('space.member@alkem.io'),
  createUserData('subspace.admin@alkem.io'),
  createUserData('subspace.member@alkem.io'),
  createUserData('subsubspace.admin@alkem.io'),
  createUserData('subsubspace.member@alkem.io'),
  createUserData('qa.user@alkem.io'),
  createUserData('notifications@alkem.io'),
  createUserData('non.space@alkem.io'),
  createUserData('beta.tester@alkem.io'),
];

export const users: Users = {
  globalAdmin: usersSetEmail[0],
  globalSupportAdmin: usersSetEmail[1],
  globalLicenseAdmin: usersSetEmail[2],
  spaceAdmin: usersSetEmail[3],
  spaceMember: usersSetEmail[4],
  subspaceAdmin: usersSetEmail[5],
  subspaceMember: usersSetEmail[6],
  subsubspaceAdmin: usersSetEmail[7],
  subsubspaceMember: usersSetEmail[8],
  qaUser: usersSetEmail[9],
  notificationsAdmin: usersSetEmail[10],
  nonSpaceMember: usersSetEmail[11],
  betaTester: usersSetEmail[12],
};


