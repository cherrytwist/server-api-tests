module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/pagination/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
