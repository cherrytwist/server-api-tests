import baseConfig from './jest.config.mjs';

export default {
  ...baseConfig,
  testRegex: ['/src/functional-api/innovation-hub/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
