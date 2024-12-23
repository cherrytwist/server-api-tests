module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/notifications/callouts/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
