module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/notifications/messaging/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
