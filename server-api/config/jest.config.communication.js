module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/communications/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
