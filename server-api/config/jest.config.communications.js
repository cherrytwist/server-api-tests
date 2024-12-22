module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/zcommunications/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
