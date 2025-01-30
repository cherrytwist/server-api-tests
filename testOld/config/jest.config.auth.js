module.exports = {
  ...require('../../server-api/config/jest.config'),
  //testMatch: ['**/?(*.)+(it-spec).ts'],
  testRegex: ['/src/non-functional/auth/my-privileges/.*\\.it-spec\\.ts'],

  coverageDirectory: '<rootDir>/coverage-it',
};
