module.exports = {
  ...require('../../test/config/jest.config'),
  testRegex: ['/test/functional-api/account/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
