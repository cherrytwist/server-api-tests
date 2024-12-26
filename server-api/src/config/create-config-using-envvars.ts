import dotenv from 'dotenv';
import { AlkemioTestConfig } from '@src/config/alkemio-test-config';
import { UniqueIDGenerator } from '@alkemio/tests-lib';

const uniqueId = UniqueIDGenerator.getID();

export const createConfigUsingEnvVars = (): AlkemioTestConfig => {
  dotenv.config();

  let registerUsers = true;
  if (process.env.SKIP_USER_REGISTRATION === 'true') {
    registerUsers = false;
  }
  const config: AlkemioTestConfig = {
    registerUsers: registerUsers,
    endPoints: {
      graphql: {
        private: process.env.API_ENDPOINT_PRIVATE_GRAPHQL ||
        'http://localhost:3000/api/private/non-interactive/graphql',
        public: process.env.API_ENDPOINT_PUBLIC_GRAPHQL || '',
      },
      server: process.env.ALKEMIO_SERVER_URL ?? 'serverURL not found',
      cluster: {
        http: process.env.ALKEMIO_BASE_URL ?? 'http://localhost:3000',
        ws: process.env.ALKEMIO_SERVER_WS ?? 'ws://localhost:3000/graphql',
        rest: process.env.ALKEMIO_SERVER_REST ?? 'http://localhost:3000/rest',
      },
      mailSlurper:  process.env.MAIL_SLURPER_ENDPOINT || 'http://localhost:4437/mail',
      kratos: {
        public: process.env.KRATOS_PUBLIC_API_URL ?? 'http://localhost:4434',
        private: process.env.KRATOS_PRIVATE_API_URL ?? 'http://localhost:4434',
      },
    },
    identities: {
      admin: {
        email: '',
        password: process.env.AUTH_TEST_HARNESS_PASSWORD ?? 'not set',
      },
      user: {
        firstName: process.env.USER_FIRST_NAME || 'fn',
        lastName: process.env.USER_LAST_NAME || 'ln',
        email: process.env.USER_EMAIL || `default${uniqueId}@alkem.io`,
      },
    },
  };
  return config;
}
