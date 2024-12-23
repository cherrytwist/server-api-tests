module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/search/.*\\.it-spec\\.ts'],
  // coverageDirectory: '<rootDir>/coverage-ci',
};
