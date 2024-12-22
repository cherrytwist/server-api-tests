module.exports = {
  ...require('./jest.config'),
  //testMatch: ['**/?(*.)+(it-spec).ts'],
  testRegex: ['/src/non-functional/orphaned-data/.*\\.it-spec\\.ts'],

  coverageDirectory: '<rootDir>/coverage-it',
};
