module.exports = {
  ...require('./jest.config'),
  testRegex: ['/src/functional-api/innovation-pack/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
