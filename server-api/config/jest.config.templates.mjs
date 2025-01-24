import baseConfig from './jest.config.mjs';

export default {
  ...baseConfig,
  testRegex: ['/src/functional-api/templates/.*\\.it-spec\\.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
