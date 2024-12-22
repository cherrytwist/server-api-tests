const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig');


module.exports = {
  rootDir: '../../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@generated/(.*)$': '<rootDir>/test/generated/$1',
    '^@utils/(.*)$': '<rootDir>/test/utils/$1',
    '^@functional-api/(.*)$': '<rootDir>/test/functional-api/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  setupFiles: ['./test/setupTests.ts'],
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [],
  testTimeout: 1800000,
  collectCoverage: false,
  globalSetup: '<rootDir>/test/testSetup.ts',
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


console.log('Global Setup Path:', require.resolve('../../test/testSetup.ts'));