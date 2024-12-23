module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/subscriptions/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
