module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/templates/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
