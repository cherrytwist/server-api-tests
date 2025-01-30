module.exports = {
  ...require('./jest.config.mjs'),
  testRegex: [
    '/src/functional-api/contributor-management/organization/.*\\.it-spec\\.ts',
  ],
  coverageDirectory: '<rootDir>/coverage-ci',
};
