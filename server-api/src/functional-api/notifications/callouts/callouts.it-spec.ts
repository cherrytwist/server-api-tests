/* eslint-disable prettier/prettier */
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { TestUser } from '@alkemio/tests-lib';
import { deleteMailSlurperMails, getMailsData } from '@utils/mailslurper.rest.requests';
import { delay } from '@alkemio/tests-lib';
import {
  createCalloutOnCollaboration,
  deleteCallout,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { users } from '@src/scenario/TestUser';
import { CalloutVisibility, PreferenceType } from '@generated/graphql';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';

const uniqueId = UniqueIDGenerator.getID();

const spaceName = 'not-up-eco-name' + uniqueId;
const subspaceName = `chName${uniqueId}`;
const subsubspaceName = `opName${uniqueId}`;

let preferencesConfigCallout: any[] = [];

let calloutDisplayName = '';
let calloutId = '';

export const templatedAsAdminResult = async (
  entityName: string,
  userEmail: string
) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: `[${entityName}] New update shared`,
      toAddresses: [userEmail],
    }),
  ]);
};

const templateResult = async (entityName: string, userEmail: string) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject: entityName,
      toAddresses: [userEmail],
    }),
  ]);
};

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'callouts',
  space: {
    collaboration: {
      addCallouts: true,
    },
    subspace: {
      collaboration: {
        addCallouts: true,
      },
      community: {
        addAdmin: true,
        addMembers: true,
      },
      subspace: {
        collaboration: {
          addCallouts: true,
        },
        community: {
          addAdmin: true,
          addMembers: true,
        },
      },
    },
  },
};

beforeAll(async () => {
  await deleteMailSlurperMails();

  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);

  preferencesConfigCallout = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationCalloutPublished,
    },

    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationCalloutPublished,
    },

    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationCalloutPublished,
    },

    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationCalloutPublished,
    },

    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationCalloutPublished,
    },

    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationCalloutPublished,
    },

    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationCalloutPublished,
    },

    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationCalloutPublished,
    },
  ];
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

afterEach(async () => {
  await deleteCallout(calloutId);
});

describe('Notifications - post', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();

    calloutDisplayName = `call-d-name-${uniqueId}`;
  });

  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationCalloutPublished,
      'false'
    );
    await changePreferenceUser(
      users.globalSupportAdmin.id,
      PreferenceType.NotificationCalloutPublished,
      'false'
    );

    preferencesConfigCallout.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'true')
    );
  });
  test('GA PUBLISH space callout - HM(7) get notifications', async () => {
    const spaceCalloutSubjectText = `${spaceName} - New post is published &#34;${calloutDisplayName}&#34;, have a look!`;
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },
      TestUser.GLOBAL_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(calloutId, CalloutVisibility.Published);

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(7);

    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.spaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(
        spaceCalloutSubjectText,
        users.subsubspaceAdmin.email
      )
    );
    expect(mails[0]).toEqual(
      await templateResult(
        spaceCalloutSubjectText,
        users.subsubspaceMember.email
      )
    );
  });

  test("GA PUBLISH space callout with 'sendNotification':'false' - HM(0) get notifications", async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },
      TestUser.GLOBAL_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.GLOBAL_ADMIN,
      false
    );

    await delay(6000);
    const mails = await getMailsData();

    // Assert
    expect(mails[1]).toEqual(0);
  });

  // ToDo: fix test
  test.skip('GA create DRAFT -> PUBLISHED -> DRAFT -> PUBLISHED space callout - HM(7) get notifications on PUBLISH event only', async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },

      TestUser.GLOBAL_ADMIN
    );

    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';
    await delay(1500);
    let mails = await getMailsData();

    expect(mails[1]).toEqual(0);

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SPACE_ADMIN
    );

    await delay(6000);
    mails = await getMailsData();

    expect(mails[1]).toEqual(7);

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Draft,
      TestUser.SPACE_ADMIN
    );

    await delay(1500);
    mails = await getMailsData();

    expect(mails[1]).toEqual(7);

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SPACE_ADMIN
    );

    await delay(6000);
    mails = await getMailsData();

    expect(mails[1]).toEqual(14);
  });

  //ToDo: Fix test
  test.skip('HA create PUBLISHED space callout type: POST - HM(7) get notifications', async () => {
    const spaceCalloutSubjectText = `${spaceName} - New post is published &#34;${calloutDisplayName}&#34;, have a look!`;
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },

      TestUser.SPACE_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SPACE_ADMIN
    );

    await delay(6000);
    const mails = await getMailsData();
    expect(mails[1]).toEqual(7);

    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.globalAdmin.email)
    );

    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.spaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(spaceCalloutSubjectText, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(
        spaceCalloutSubjectText,
        users.subsubspaceAdmin.email
      )
    );
    expect(mails[0]).toEqual(
      await templateResult(
        spaceCalloutSubjectText,
        users.subsubspaceMember.email
      )
    );
  });

  // Skip until is updated the mechanism for whiteboard callout creation
  test.skip('HA create PUBLISHED space callout type: WHITEBOARD - HM(7) get notifications', async () => {
    const spaceCalloutSubjectText = `${spaceName} - New post is published &#34;${calloutDisplayName}&#34;, have a look!`;
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },

      TestUser.SPACE_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SPACE_ADMIN
    );

    await delay(6000);
    const mails = await getMailsData();

    // expect(mails[0]).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       subject: spaceCalloutSubjectText,
    //       toAddresses: [users.globalAdmin.email],
    //     }),
    //   ])
    // );

    // expect(mails[0]).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       subject: spaceCalloutSubjectText,
    //       toAddresses: [users.spaceAdmin.email],
    //     }),
    //   ])
    // );
    // expect(mails[0]).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       subject: spaceCalloutSubjectText,
    //       toAddresses: [users.qaUser.email],
    //     }),
    //   ])
    // );
    // expect(mails[0]).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       subject: spaceCalloutSubjectText,
    //       toAddresses: [users.spaceMember.email],
    //     }),
    //   ])
    // );

    // expect(mails[0]).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       subject: spaceCalloutSubjectText,
    //       toAddresses: [`${spaceMemOnly}`],
    //     }),
    //   ])
    // );
    // expect(mails[0]).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       subject: spaceCalloutSubjectText,
    //       toAddresses: [subspaceAndSpaceMemOnly],
    //     }),
    //   ])
    // );
    // expect(mails[0]).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       subject: spaceCalloutSubjectText,
    //       toAddresses: [subsubspaceAndSubspaceAndSpaceMem],
    //     }),
    //   ])
    // );
    expect(mails[1]).toEqual(7);
  });

  test('HA create PUBLISHED subspace callout type: POST - CM(5) get notifications', async () => {
    const calloutSubjectText = `${subspaceName} - New post is published &#34;${calloutDisplayName}&#34;, have a look!`;
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.subspace.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },
      TestUser.SPACE_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SPACE_ADMIN
    );

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(5);

    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.globalAdmin.email)
    );

    // Don't receive as Space Admin is not member of subspace
    expect(mails[0]).not.toEqual(
      await templateResult(calloutSubjectText, users.spaceAdmin.email)
    );
    // Don't receive as Space Member is not member of subspace
    expect(mails[0]).not.toEqual(
      await templateResult(calloutSubjectText, users.spaceMember.email)
    );

    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.subspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.subsubspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.subsubspaceMember.email)
    );
  });

  test("HA create PUBLISHED subspace callout type: POST with 'sendNotification':'false' - CM(0) get notifications", async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.subspace.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },
      TestUser.SPACE_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SPACE_ADMIN,
      false
    );

    await delay(6000);
    const mails = await getMailsData();

    // Assert
    expect(mails[1]).toEqual(0);
  });

  test('OA create PUBLISHED subsubspace callout type: POST - OM(4) get notifications', async () => {
    const calloutSubjectText = `${subsubspaceName} - New post is published &#34;${calloutDisplayName}&#34;, have a look!`;
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.subsubspace.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },
      TestUser.SUBSUBSPACE_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';
    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SUBSUBSPACE_ADMIN
    );

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(3);

    // GA - 1 mails as subsubspace member; as admin - 0
    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.globalAdmin.email)
    );

    // Don't receive as Space Admin is not member of subsubspace
    expect(mails[0]).not.toEqual(
      await templateResult(calloutSubjectText, users.spaceAdmin.email)
    );
    // Don't receive as Space Member is not member of subsubspace
    expect(mails[0]).not.toEqual(
      await templateResult(calloutSubjectText, users.spaceMember.email)
    );

    // Don't receive as Subspace Member is not member of subsubspace
    expect(mails[0]).not.toEqual(
      await templateResult(calloutSubjectText, users.subspaceAdmin.email)
    );

    // Don't receive as Subspace Member is not member of subsubspace
    expect(mails[0]).not.toEqual(
      await templateResult(calloutSubjectText, users.subspaceMember.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.subsubspaceAdmin.email)
    );
    expect(mails[0]).toEqual(
      await templateResult(calloutSubjectText, users.subsubspaceMember.email)
    );
  });

  test("OA create PUBLISHED subsubspace callout type: POST with 'sendNotification':'false' - OM(0) get notifications", async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.subsubspace.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },
      TestUser.SUBSUBSPACE_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';
    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SUBSUBSPACE_ADMIN,
      false
    );

    await delay(6000);
    const mails = await getMailsData();

    // Assert
    expect(mails[1]).toEqual(0);
  });

  test('OA create PUBLISHED subsubspace callout type: POST - 0 notifications - all roles with notifications disabled', async () => {
    preferencesConfigCallout.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.subsubspace.collaboration.id,
      { framing: { profile: { displayName: calloutDisplayName } } },
      TestUser.SUBSUBSPACE_ADMIN
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published,
      TestUser.SUBSUBSPACE_ADMIN
    );

    // Assert
    await delay(1500);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(0);
  });
});
