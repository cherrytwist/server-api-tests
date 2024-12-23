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
  GLOBAL_HUBS_ADMIN = 'global.spaces',
  GLOBAL_COMMUNITY_ADMIN = 'community.admin',
  HUB_ADMIN = 'space.admin',
  HUB_MEMBER = 'space.member',
  CHALLENGE_MEMBER = 'challenge.member',
  CHALLENGE_ADMIN = 'challenge.admin',
  OPPORTUNITY_MEMBER = 'opportunity.member',
  OPPORTUNITY_ADMIN = 'opportunity.admin',
  NON_HUB_MEMBER = 'non.space',
  QA_USER = 'qa.user',
  BETA_TESTER = 'beta.tester',
}
