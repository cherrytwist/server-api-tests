import { SubscriptionClient } from '@utils/subscriptions';
import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();
import { deleteSpace } from '../journey/space/space.request.params';
import { createSubsubspace } from '@src/graphql/mutations/journeys/subsubspace';
import { subscriptionSubsubspaceCreated } from './subscrition-queries';
import {
  createSubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { entitiesId } from '../../types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { TestUser } from '@alkemio/tests-lib';
import { delay } from '@alkemio/tests-lib';

const organizationName = 'com-sub-org-n' + uniqueId;
const hostNameId = 'com-sub-org-nd' + uniqueId;
const spaceName = 'com-sub-eco-n' + uniqueId;
const spaceNameId = 'com-sub-eco-nd' + uniqueId;
const subspaceName = 'ch1-display-name' + uniqueId;

const subsubspaceDisplayName1 = 'opp1-disp-name' + uniqueId;
const subsubspaceDisplayName2 = 'opp2-disp-name' + uniqueId;
let subsubspaceIdOne = '';
let subsubspaceIdTwo = '';

let subscription1: SubscriptionClient;
let subscription2: SubscriptionClient;
let subscription3: SubscriptionClient;

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );

  await createSubspaceWithUsers(subspaceName);
});

afterAll(async () => {
  subscription1.terminate();
  subscription2.terminate();
  subscription3.terminate();

  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});
describe('Create subsubspace subscription', () => {
  beforeAll(async () => {
    subscription1 = new SubscriptionClient();
    subscription2 = new SubscriptionClient();
    subscription3 = new SubscriptionClient();

    const utilizedQuery = {
      operationName: 'SubsubspaceCreated',
      query: subscriptionSubsubspaceCreated,
      variables: { subspaceID: entitiesId.subspace.id },
    };

    await subscription1.subscribe(utilizedQuery, TestUser.GLOBAL_ADMIN);
    await subscription2.subscribe(utilizedQuery, TestUser.SPACE_ADMIN);
    await subscription3.subscribe(utilizedQuery, TestUser.SPACE_MEMBER);
  });

  afterAll(async () => {
    subscription1.terminate();
    subscription2.terminate();
    subscription3.terminate();
  });

  afterEach(async () => {
    await deleteSpace(subsubspaceIdOne);
    await deleteSpace(subsubspaceIdTwo);
  });

  it('receive newly created opportunities', async () => {
    // Create subsubspace
    const resOne = await createSubsubspace(
      subsubspaceDisplayName1,
      subsubspaceDisplayName1,
      entitiesId.subspace.id
    );
    subsubspaceIdOne = resOne?.data?.createSubspace.id ?? '';

    const resTwo = await createSubsubspace(
      subsubspaceDisplayName2,
      subsubspaceDisplayName2,
      entitiesId.subspace.id,
      TestUser.SPACE_ADMIN
    );
    subsubspaceIdTwo = resTwo?.data?.createSubspace.id ?? '';

    await delay(500);

    const expectedData = [
      {
        subsubspaceCreated: {
          subsubspace: { profile: { displayName: subsubspaceDisplayName1 } },
        },
      },
      {
        subsubspaceCreated: {
          subsubspace: { profile: { displayName: subsubspaceDisplayName2 } },
        },
      },
    ];

    // assert number of created opportunities
    expect(subscription1.getMessages().length).toBe(2);
    expect(subscription2.getMessages().length).toBe(2);
    expect(subscription3.getMessages().length).toBe(2);

    // assert the latest is from the correct mutation and mutation result
    expect(subscription1.getLatest()).toHaveProperty('subsubspaceCreated');
    expect(subscription2.getLatest()).toHaveProperty('subsubspaceCreated');
    expect(subscription3.getLatest()).toHaveProperty('subsubspaceCreated');

    // assert all newly created opportunities are displayed to subscribers
    expect(subscription1.getMessages()).toEqual(expectedData);
    expect(subscription2.getMessages()).toEqual(expectedData);
    expect(subscription3.getMessages()).toEqual(expectedData);
  });
});
