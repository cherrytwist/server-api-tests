module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/lookup/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
