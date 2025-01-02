module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/journey/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
