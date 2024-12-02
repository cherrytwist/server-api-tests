module.exports = {
  ...require('./jest.config'),
  testRegex: [
    '/test/functional-api/contributor-management/organization/.*\\.it-spec\\.ts',
    '/test/functional-api/preferences/.*\\.it-spec\\.ts',
    '/test/functional-api/roleset/.*\\.it-spec\\.ts',
    '/test/functional-api/contributor-management/.*\\.it-spec\\.ts',
    '/test/functional-api/callout/.*\\.it-spec\\.ts',
    '/test/functional-api/zcommunications/.*\\.it-spec\\.ts',
    '/test/functional-api/activity-logs/.*\\.it-spec\\.ts',
    '/test/functional-api/journey/.*\\.it-spec\\.ts',
    '/test/functional-api/storage/.*\\.it-spec\\.ts',
    '/test/functional-api/entitlements/.*\\.it-spec\\.ts',
  ],
  coverageDirectory: '<rootDir>/coverage-nightly',
};
