module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/platform/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
