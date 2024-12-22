module.exports = {
  ...require('./jest.config'),
  testRegex: [
    '/src/functional-api/templates/innovation-flow/.*\\.it-spec\\.ts',
  ],
  coverageDirectory: '<rootDir>/coverage-ci',
};
