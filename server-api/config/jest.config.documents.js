module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/integration/documents/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
