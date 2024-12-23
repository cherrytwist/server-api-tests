module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/configuration/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
