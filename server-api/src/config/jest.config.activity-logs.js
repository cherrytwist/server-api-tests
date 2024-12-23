module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/activity-logs/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
