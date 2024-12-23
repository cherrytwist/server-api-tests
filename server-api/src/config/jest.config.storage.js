module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/storage/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
