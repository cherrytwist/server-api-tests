module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/roleset/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
