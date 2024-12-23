const { compilerOptions } = require('../../tsconfig');
const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  rootDir: '../../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@generated/(.*)$': '<rootDir>/src/core/generated/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@functional-api/(.*)$': '<rootDir>/src/functional-api/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  setupFiles: ['<rootDir>/src/setupTests.ts'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [],
  testTimeout: 1800000,
  collectCoverage: false,
  globalSetup: '<rootDir>/src/globalTestsSetup.ts',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './html-report',
        filename: `report${new Date().getDay()}_${new Date().getMonth()}_${new Date().getFullYear()}_${new Date().getHours()}_${new Date().getMinutes()}_${new Date().getSeconds()}_${new Date().getMilliseconds()}.html`,
        openReport: true,
      },
    ],
  ],
};

console.log('Path mappings:', compilerOptions.paths);
// console.log(
//   'Resolved @src/common/enum/test.user:',
//   require.resolve('@src/common/enum/test.user')
// );

// pathsToModuleNameMapper(compilerOptions.paths, {
//   prefix: '<rootDir>/',
// }),