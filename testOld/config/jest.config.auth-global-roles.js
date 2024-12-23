module.exports = {
  ...require('../../server-api/config/jest.config'),
  //testMatch: ['**/?(*.)+(it-spec).ts'],
  testRegex: [
    '/src/non-functional/auth/my-privileges/global-roles/.*\\.it-spec\\.ts',
  ],

  coverageDirectory: '<rootDir>/coverage-it',
};
