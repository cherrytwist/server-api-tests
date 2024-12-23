module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/notifications/community/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
