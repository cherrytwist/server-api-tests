module.exports = {
  ...require('../../server-api/config/jest.config'),
  testMatch: ['**/?(*.)+(it-spec).ts'],
  coverageDirectory: '<rootDir>/coverage-it',
};
