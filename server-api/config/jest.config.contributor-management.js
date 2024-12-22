module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/contributor-management/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
