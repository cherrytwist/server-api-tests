module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/notifications/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
