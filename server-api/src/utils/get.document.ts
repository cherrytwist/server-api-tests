import request from 'supertest';
import { TestUser } from '@alkemio/tests-lib';
import { testConfiguration } from '@src/config/test.configuration';
import { TestUserManager } from '@src/scenario/test.user.manager';

export const getDocument = (documentId: string) => {
  return request(buildDocumentUrl(documentId)).get('');
};

export const getAuthDocument = async (documentId: string, user?: TestUser) => {
  if (!user) {
    return getDocument(documentId);
  }
  const userModel = TestUserManager.getUserModelByType(user);
  const bearerToken = userModel.authToken;

  if (!bearerToken) {
    throw console.error(`Could not authenticate user ${user}`);
  }

  return getDocument(documentId).set('Authorization', `Bearer ${bearerToken}`);
};

const buildDocumentUrl = (documentId: string) =>
  `${testConfiguration.endPoints.rest}/storage/document/${documentId}`;
