module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/callout/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
