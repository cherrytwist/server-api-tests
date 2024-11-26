module.exports = {
  ...require('./jest.config'),
  testRegex: ['/test/functional-api/entitlements/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
