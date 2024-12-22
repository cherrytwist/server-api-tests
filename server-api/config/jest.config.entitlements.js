module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/entitlements/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
