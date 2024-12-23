module.exports = {
  ...require('./jest.config'),
  // '**/?(*.)+(spec).ts',
  testRegex: ['/src/functional-api/.*\\/.*\\.it-spec.ts'],
  coverageDirectory: '<rootDir>/coverage-ci',
};
