
import { UserModel } from './models/UserModel';

interface Users {
  globalAdmin: UserModel;
  globalSupportAdmin: UserModel;
  globalLicenseAdmin: UserModel;
  spaceAdmin: UserModel;
  spaceMember: UserModel;
  subspaceAdmin: UserModel;
  subspaceMember: UserModel;
  subsubspaceAdmin: UserModel;
  subsubspaceMember: UserModel;
  qaUser: UserModel;
  notificationsAdmin: UserModel;
  nonSpaceMember: UserModel;
  betaTester: UserModel;
}

const createUserData = (email: string): UserModel => ({
  email,
  id: '',
  displayName: '',
  profileId: '',
  nameId: '',
  agentId: '',
  accountId: '',
  authToken: '',
});

export const usersSetEmail: UserModel[] = [
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





