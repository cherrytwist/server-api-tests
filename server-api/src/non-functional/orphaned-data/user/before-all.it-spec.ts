import {
  createChallengeForOrgSpace,
  createOpportunityForChallenge,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import { uniqueId } from '@utils/uniqueId';

const organizationName = 'post-org-name' + uniqueId;
const hostNameId = 'post-org-nameid' + uniqueId;
const spaceName = 'post-eco-name' + uniqueId;
const spaceNameId = 'post-eco-nameid' + uniqueId;
const opportunityName = 'post-opp';
const challengeName = 'post-chal';

beforeAll(async () => {
  await createOrgAndSpace(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createChallengeForOrgSpace(challengeName);
  await createOpportunityForChallenge(opportunityName);
});
describe('User', () => {
  test('test', async () => {
    expect('test').toBe('test');
  });
});
