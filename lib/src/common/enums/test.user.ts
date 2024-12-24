/**
 * Enum with CT users used for testing different auth scenarios.
 * These users need to be created in CT Client (so both Profile and Account are created)
 * in order to add new test users / roles for API tests for auth, add the users here and
 * create them in CT client - all with the same password. Add the password to .env
 * to AUTH_TEST_HARNESS_PASSWORD env variable. AUTH_AAD_UPN_DOMAIN also needs to be
 * set to the domain against whom tests will be ran.
 */
export enum TestUser {
  GLOBAL_ADMIN = 'admin',
  GLOBAL_LICENSE_ADMIN = 'global.license',
  GLOBAL_SUPPORT_ADMIN = 'global.support',
  SPACE_ADMIN = 'space.admin',
  SPACE_MEMBER = 'space.member',
  SUBSPACE_MEMBER = 'subspace.member',
  SUBSPACE_ADMIN = 'subspace.admin',
  SUBSUBSPACE_MEMBER = 'subsubspace.member',
  SUBSUBSPACE_ADMIN = 'subsubspace.admin',
  NON_SPACE_MEMBER = 'non.space',
  QA_USER = 'qa.user',
  GLOBAL_BETA_TESTER = 'beta.tester',
}
