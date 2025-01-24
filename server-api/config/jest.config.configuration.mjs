import baseConfig from './jest.config.mjs';

export default {
  ...baseConfig,
  testRegex: ['/src/functional-api/configuration/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
