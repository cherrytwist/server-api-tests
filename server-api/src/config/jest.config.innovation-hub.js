module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/innovation-hub/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
