const { compilerOptions } = require('../tsconfig');


module.exports = {
  rootDir: '..',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@generated/(.*)$': '<rootDir>/src/generated/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@functional-api/(.*)$': '<rootDir>/src/functional-api/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  setupFiles: ['./src/setupTests.ts'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [],
  testTimeout: 1800000,
  collectCoverage: false,
  globalSetup: '<rootDir>/src/testSetup.ts',
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