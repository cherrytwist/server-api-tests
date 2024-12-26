import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { TestUser } from '@alkemio/tests-lib';
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import { delay } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import { sendMessageToRoom } from '@functional-api/communications/communication.params';
import { getMailsData } from '@src/types/entities-helper';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { PreferenceType } from '@generated/graphql';
import { TestScenarioFactory } from '@src/models/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/models/test-scenario-config';

const uniqueId = UniqueIDGenerator.getID();

const spaceName = 'not-up-eco-name' + uniqueId;
const subspaceName = `chName${uniqueId}`;
const subsubspaceName = `opName${uniqueId}`;
let preferencesConfig: any[] = [];
const postSubjectTextMember = `${spaceName} - New comment received on Callout \u0026#34;Space Post Callout\u0026#34;, have a look!`;

const expectedDataSpace = async (toAddresses: any[]) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: postSubjectTextMember,
      toAddresses,
    }),
  ]);
};

const expectedDataChal = async (toAddresses: any[]) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: `${subspaceName} - New comment received on Callout \u0026#34;Subspace Post Callout\u0026#34;, have a look!`,
      toAddresses,
    }),
  ]);
};

const expectedDataOpp = async (toAddresses: any[]) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: `${subsubspaceName} - New comment received on Callout \u0026#34;Subsubspace Post Callout\u0026#34;, have a look!`,
      toAddresses,
    }),
  ]);
};

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'subspace-activity',
  space: {
    collaboration: {
      addCallouts: true,
    },
    subspace: {
      collaboration: {
        addCallouts: true,
      },
      community: {
        addMembers: true,
        addAdmin: true,
      },
      subspace: {
        collaboration: {
          addCallouts: true,
        },
        community: {
          addMembers: true,
          addAdmin: true,
        },
      },
    },
  },
};

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);

  preferencesConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },

    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },

    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },

    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },

    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },

    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },

    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },

    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationDiscussionCommentCreated,
    },
  ];
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Notifications - callout comments', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationDiscussionCommentCreated,
      'false'
    );

    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'true')
    );
  });

  // ToDo: fix test
  test.skip('GA create space callout comment - HM(7) get notifications', async () => {
    // Act
    await sendMessageToRoom(
      baseScenario.space.collaboration.calloutPostCommentsId,
      'comment on discussion callout',
      TestUser.GLOBAL_ADMIN
    );

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(7);
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.globalAdmin.email])
    );
    expect(mails[0]).toEqual(await expectedDataSpace([users.spaceAdmin.email]));
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.spaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subspaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subsubspaceMember.email])
    );
  });

  // ToDo: fix test
  test.skip('HA create space callout comment - HM(7) get notifications', async () => {
    // Act
    await sendMessageToRoom(
      baseScenario.space.collaboration.calloutPostCommentsId,
      'comment on discussion callout',
      TestUser.SPACE_ADMIN
    );

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(7);
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.globalAdmin.email])
    );
    expect(mails[0]).toEqual(await expectedDataSpace([users.spaceAdmin.email]));
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.spaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subspaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataSpace([users.subsubspaceMember.email])
    );
  });

  test('HA create subspace callout comment - HM(5),  get notifications', async () => {
    // Act
    await sendMessageToRoom(
      baseScenario.subspace.collaboration.calloutPostCommentsId,
      'comment on discussion callout',
      TestUser.SPACE_ADMIN
    );

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(5);

    expect(mails[0]).toEqual(await expectedDataChal([users.globalAdmin.email]));
    // HA don't get notification as is member only of HUB
    expect(mails[0]).not.toEqual(
      await expectedDataChal([users.spaceAdmin.email])
    );
    // Space member does not reacive email

    expect(mails[0]).not.toEqual(
      await expectedDataChal([users.spaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataChal([users.subspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataChal([users.subspaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataChal([users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataChal([users.subsubspaceMember.email])
    );
  });

  test('OM create subsubspace callout comment - HM(3), get notifications', async () => {
    // Act
    await sendMessageToRoom(
      baseScenario.subsubspace.collaboration.calloutPostCommentsId,
      'comment on discussion callout',
      TestUser.SUBSUBSPACE_MEMBER
    );

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(3);
    expect(mails[0]).toEqual(await expectedDataOpp([users.globalAdmin.email]));
    // HA don't get notification as is member only of HUB
    expect(mails[0]).not.toEqual(
      await expectedDataOpp([users.spaceAdmin.email])
    );
    // Space member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataOpp([users.spaceMember.email])
    );
    // Subspace admin does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataOpp([users.subspaceAdmin.email])
    );
    // Subspace member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataOpp([users.subspaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataOpp([users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataOpp([users.subsubspaceMember.email])
    );
  });

  test('OA create subsubspace callout comment - 0 notifications - all roles with notifications disabled', async () => {
    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );
    // Act
    await sendMessageToRoom(
      baseScenario.subsubspace.collaboration.calloutPostCommentsId,
      'comment on discussion callout',
      TestUser.SUBSUBSPACE_ADMIN
    );

    // Assert
    await delay(1500);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(0);
  });
});
