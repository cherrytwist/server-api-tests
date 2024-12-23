module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/integration/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
