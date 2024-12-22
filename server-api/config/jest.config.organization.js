module.exports = {
  ...require('./jest.config'),
  testRegex: [
    '/src/functional-api/contributor-management/organization/.*\\.it-spec\\.ts',
  ],
  coverageDirectory: '<rootDir>/coverage-ci',
};
