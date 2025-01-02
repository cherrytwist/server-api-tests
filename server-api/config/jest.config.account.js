module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/account/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
