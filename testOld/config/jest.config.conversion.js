module.exports = {
  ...require('../../server-api/config/jest.config'),
  testRegex: ['/src/functional-api/conversions/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
