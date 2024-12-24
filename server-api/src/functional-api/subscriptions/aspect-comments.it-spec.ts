import { SubscriptionClient } from '@utils/subscriptions';
import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();
import { createPostOnCallout } from '../callout/post/post.request.params';
import { deleteSpace } from '../journey/space/space.request.params';
import { subscriptionRooms } from './subscrition-queries';
import { users } from '@utils/queries/users-data';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { sendMessageToRoom } from '../communications/communication.params';
import { entitiesId } from '../../types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { TestUser } from '@alkemio/tests-lib';
import { delay } from '@alkemio/tests-lib';

const organizationName = 'com-sub-org-n' + uniqueId;
const hostNameId = 'com-sub-org-nd' + uniqueId;
const spaceName = 'com-sub-eco-n' + uniqueId;
const spaceNameId = 'com-sub-eco-nd' + uniqueId;
const subspaceName = `chname${uniqueId}`;
const subsubspaceName = `opname${uniqueId}`;
const postNameID = `asp-name-id-${uniqueId}`;
const postDisplayName = `post-d-name-${uniqueId}`;
let postCommentsIdSpace = '';
let postCommentsIdSubspace = '';
let postCommentsIdSubsubspace = '';

let messageGaId = '';
let messageHaId = '';
let messageHmId = '';

const messageGAText = 'GA test message on post';
const messageHAText = 'HA test message on post';
const messageHMText = 'HM test message on post';

let subscription1: SubscriptionClient;
let subscription2: SubscriptionClient;
let subscription3: SubscriptionClient;

const expectedDataFunc = async (
  messageGaId: string,
  messageHaId: string,
  messageHmId: string
) => {
  return [
    expect.objectContaining({
      roomEvents: {
        message: {
          data: {
            id: messageGaId,
            message: messageGAText,
            sender: { id: users.globalAdmin.id },
          },
        },
      },
    }),
    expect.objectContaining({
      roomEvents: {
        message: {
          data: {
            id: messageHaId,
            message: messageHAText,
            sender: { id: users.spaceAdmin.id },
          },
        },
      },
    }),
    expect.objectContaining({
      roomEvents: {
        message: {
          data: {
            id: messageHmId,
            message: messageHMText,
            sender: { id: users.spaceMember.id },
          },
        },
      },
    }),
  ];
};

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );

  await createSubspaceWithUsers(subspaceName);
  await createSubsubspaceWithUsers(subsubspaceName);
});

afterAll(async () => {
  subscription1.terminate();
  subscription2.terminate();
  subscription3.terminate();

  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});
describe('Post comments subscription', () => {
  describe('Space comments subscription ', () => {
    beforeAll(async () => {
      const resPostonSpace = await createPostOnCallout(
        entitiesId.space.calloutId,
        { displayName: postDisplayName },
        postNameID,
        TestUser.GLOBAL_ADMIN
      );
      postCommentsIdSpace =
        resPostonSpace.data?.createContributionOnCallout.post?.comments.id ??
        '';

      subscription1 = new SubscriptionClient();
      subscription2 = new SubscriptionClient();
      subscription3 = new SubscriptionClient();

      const utilizedQuery = {
        operationName: 'roomEvents',
        query: subscriptionRooms,
        variables: { roomID: postCommentsIdSpace },
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

    it('receives message after new comment is created - 3 sender / 3 receivers', async () => {
      // create comment
      const messageGA = await sendMessageToRoom(
        postCommentsIdSpace,
        messageGAText,
        TestUser.GLOBAL_ADMIN
      );
      messageGaId = messageGA?.data?.sendMessageToRoom.id;

      const messageHA = await sendMessageToRoom(
        postCommentsIdSpace,
        messageHAText,
        TestUser.SPACE_ADMIN
      );
      messageHaId = messageHA?.data?.sendMessageToRoom.id;

      const messageHM = await sendMessageToRoom(
        postCommentsIdSpace,
        messageHMText,
        TestUser.SPACE_MEMBER
      );
      messageHmId = messageHM?.data?.sendMessageToRoom.id;

      await delay(500);
      // // assert number of received messages
      expect(subscription1.getMessages().length).toBe(3);
      expect(subscription2.getMessages().length).toBe(3);
      expect(subscription3.getMessages().length).toBe(3);

      // assert the latest is from the correct mutation and mutation result
      expect(subscription1.getLatest()).toHaveProperty('roomEvents');
      expect(subscription2.getLatest()).toHaveProperty('roomEvents');
      expect(subscription3.getLatest()).toHaveProperty('roomEvents');

      // assert all messages are received from all subscribers
      expect(subscription1.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
      expect(subscription2.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
      expect(subscription3.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
    });
  });

  describe('Subspace comments subscription ', () => {
    beforeAll(async () => {
      const resPostonSubspace = await createPostOnCallout(
        entitiesId.subspace.calloutId,
        { displayName: postDisplayName + 'ch' },
        postNameID + 'ch',
        TestUser.GLOBAL_ADMIN
      );
      postCommentsIdSubspace =
        resPostonSubspace.data?.createContributionOnCallout.post?.comments
          .id ?? '';

      subscription1 = new SubscriptionClient();
      subscription2 = new SubscriptionClient();
      subscription3 = new SubscriptionClient();

      const utilizedQuery = {
        operationName: 'roomEvents',
        query: subscriptionRooms,
        variables: { roomID: postCommentsIdSubspace },
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
    it('receives message after new comment is created - 3 sender / 3 receivers', async () => {
      // create comment
      const messageGA = await sendMessageToRoom(
        postCommentsIdSubspace,
        messageGAText,
        TestUser.GLOBAL_ADMIN
      );
      messageGaId = messageGA?.data?.sendMessageToRoom.id;

      const messageHA = await sendMessageToRoom(
        postCommentsIdSubspace,
        messageHAText,
        TestUser.SPACE_ADMIN
      );
      messageHaId = messageHA?.data?.sendMessageToRoom.id;

      const messageHM = await sendMessageToRoom(
        postCommentsIdSubspace,
        messageHMText,
        TestUser.SPACE_MEMBER
      );
      messageHmId = messageHM?.data?.sendMessageToRoom.id;

      await delay(500);

      // // assert number of received messages
      expect(subscription1.getMessages().length).toBe(3);
      expect(subscription2.getMessages().length).toBe(3);
      expect(subscription3.getMessages().length).toBe(3);

      // assert the latest is from the correct mutation and mutation result
      expect(subscription1.getLatest()).toHaveProperty('roomEvents');
      expect(subscription2.getLatest()).toHaveProperty('roomEvents');
      expect(subscription3.getLatest()).toHaveProperty('roomEvents');

      // assert all messages are received from all subscribers
      expect(subscription1.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
      expect(subscription2.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
      expect(subscription3.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
    });
  });

  describe('Subsubspace comments subscription ', () => {
    beforeAll(async () => {
      const resPostonSubspace = await createPostOnCallout(
        entitiesId.subsubspace.calloutId,
        { displayName: postDisplayName + 'opp' },
        postNameID + 'opp',
        TestUser.GLOBAL_ADMIN
      );

      postCommentsIdSubsubspace =
        resPostonSubspace.data?.createContributionOnCallout.post?.comments
          .id ?? '';

      subscription1 = new SubscriptionClient();
      subscription2 = new SubscriptionClient();
      subscription3 = new SubscriptionClient();

      const utilizedQuery = {
        operationName: 'roomEvents',
        query: subscriptionRooms,
        variables: { roomID: postCommentsIdSubsubspace },
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
    it('receives message after new comment is created - 3 sender / 3 receivers', async () => {
      // create comment
      const messageGA = await sendMessageToRoom(
        postCommentsIdSubsubspace,
        messageGAText,
        TestUser.GLOBAL_ADMIN
      );
      messageGaId = messageGA?.data?.sendMessageToRoom.id;

      const messageHA = await sendMessageToRoom(
        postCommentsIdSubsubspace,
        messageHAText,
        TestUser.SPACE_ADMIN
      );
      messageHaId = messageHA?.data?.sendMessageToRoom.id;

      const messageHM = await sendMessageToRoom(
        postCommentsIdSubsubspace,
        messageHMText,
        TestUser.SPACE_MEMBER
      );
      messageHmId = messageHM?.data?.sendMessageToRoom.id;

      await delay(500);

      // // assert number of received messages
      expect(subscription1.getMessages().length).toBe(3);
      expect(subscription2.getMessages().length).toBe(3);
      expect(subscription3.getMessages().length).toBe(3);

      // assert the latest is from the correct mutation and mutation result
      expect(subscription1.getLatest()).toHaveProperty('roomEvents');
      expect(subscription2.getLatest()).toHaveProperty('roomEvents');
      expect(subscription3.getLatest()).toHaveProperty('roomEvents');

      // assert all messages are received from all subscribers
      expect(subscription1.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
      expect(subscription2.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
      expect(subscription3.getMessages()).toEqual(
        await expectedDataFunc(messageGaId, messageHaId, messageHmId)
      );
    });
  });
});
