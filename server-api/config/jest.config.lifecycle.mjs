import baseConfig from './jest.config.mjs';

export default {
  ...baseConfig,
  testRegex: [
    '/src/functional-api/templates/innovation-flow/.*\\.it-spec\\.ts',
  ],
  coverageDirectory: '<rootDir>/coverage-ci',
};
