import baseConfig from './jest.config.mjs';

export default {
  ...baseConfig,
  testRegex: ['/src/functional-api/search/.*\\.it-spec\\.ts'],
  // coverageDirectory: '<rootDir>/coverage-ci',
};
