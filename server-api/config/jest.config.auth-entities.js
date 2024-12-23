module.exports = {
  ...require('./jest.config'),
  //testMatch: ['**/?(*.)+(it-spec).ts'],
  testRegex: [
    '/src/non-functional/auth/my-privileges/entity-based/.*\\.it-spec\\.ts',
  ],

  coverageDirectory: '<rootDir>/coverage-it',
};
