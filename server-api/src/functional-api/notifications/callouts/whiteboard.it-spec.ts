/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestUser } from '@alkemio/tests-lib';
import {
  deleteMailSlurperMails,
  getMailsData,
} from '@utils/mailslurper.rest.requests';
import { delay } from '@alkemio/tests-lib';
import { TestUserManager } from '@src/scenario/TestUserManager';
import {
  createWhiteboardCalloutOnCalloutsSet,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import { createWhiteboardOnCallout } from '@functional-api/callout/call-for-whiteboards/whiteboard-collection-callout.params.request';
import { deleteWhiteboard } from '@functional-api/callout/whiteboard/whiteboard-callout.params.request';

import {
  CalloutType,
  CalloutVisibility,
  PreferenceType,
} from '@generated/alkemio-schema';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';

let spaceWhiteboardId = '';
let preferencesConfig: any[] = [];
let whiteboardCollectionSpaceCalloutId = '';

let whiteboardCollectionSubspaceCalloutId = '';

let whiteboardCollectionSubsubspaceCalloutId = '';

const expectedDataFunc = async (subject: string, toAddresses: any[]) => {
  return expect.arrayContaining([
    expect.objectContaining({
      subject,
      toAddresses,
    }),
  ]);
};

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'whiteboard-notifications',
  space: {
    collaboration: {
      addPostCallout: true,
      addPostCollectionCallout: true,
      addWhiteboardCallout: true,
    },
    community: {
      admins: [TestUser.SPACE_ADMIN],
      members: [
        TestUser.SPACE_MEMBER,
        TestUser.SPACE_ADMIN,
        TestUser.SUBSPACE_MEMBER,
        TestUser.SUBSPACE_ADMIN,
        TestUser.SUBSUBSPACE_MEMBER,
        TestUser.SUBSUBSPACE_ADMIN,
      ],
    },
    subspace: {
      collaboration: {
        addPostCallout: true,
        addPostCollectionCallout: true,
        addWhiteboardCallout: true,
      },
      community: {
        admins: [TestUser.SUBSPACE_ADMIN],
        members: [
          TestUser.SUBSPACE_MEMBER,
          TestUser.SUBSPACE_ADMIN,
          TestUser.SUBSUBSPACE_MEMBER,
          TestUser.SUBSUBSPACE_ADMIN,
        ],
      },
      subspace: {
        collaboration: {
          addPostCallout: true,
          addPostCollectionCallout: true,
          addWhiteboardCallout: true,
        },
        community: {
          admins: [TestUser.SUBSUBSPACE_ADMIN],
          members: [TestUser.SUBSUBSPACE_MEMBER, TestUser.SUBSUBSPACE_ADMIN],
        },
      },
    },
  },
};

beforeAll(async () => {
  await deleteMailSlurperMails();
  baseScenario = await TestScenarioFactory.createBaseScenario(scenarioConfig);

  const resSpace = await createWhiteboardCalloutOnCalloutsSet(
    baseScenario.space.collaboration.calloutsSetId,
    {
      framing: {
        profile: {
          displayName: 'whiteboard callout space',
          description: 'test',
        },
      },
      type: CalloutType.WhiteboardCollection,
    },
    TestUser.GLOBAL_ADMIN
  );
  whiteboardCollectionSpaceCalloutId =
    resSpace?.data?.createCalloutOnCalloutsSet.id ?? '';

  await updateCalloutVisibility(
    whiteboardCollectionSpaceCalloutId,
    CalloutVisibility.Published
  );

  const resSubspace = await createWhiteboardCalloutOnCalloutsSet(
    baseScenario.subspace.collaboration.calloutsSetId,
    {
      framing: {
        profile: {
          displayName: 'whiteboard callout subspace',
          description: '',
        },
      },
      type: CalloutType.WhiteboardCollection,
    },
    TestUser.GLOBAL_ADMIN
  );
  whiteboardCollectionSubspaceCalloutId =
    resSubspace?.data?.createCalloutOnCalloutsSet.id ?? '';

  await updateCalloutVisibility(
    whiteboardCollectionSubspaceCalloutId,
    CalloutVisibility.Published
  );

  const resSubsubspace = await createWhiteboardCalloutOnCalloutsSet(
    baseScenario.subsubspace.collaboration.calloutsSetId,
    {
      framing: {
        profile: {
          displayName: 'whiteboard callout subsubspace',
          description: 'test',
        },
      },
      type: CalloutType.WhiteboardCollection,
    },
    TestUser.GLOBAL_ADMIN
  );
  whiteboardCollectionSubsubspaceCalloutId =
    resSubsubspace?.data?.createCalloutOnCalloutsSet.id ?? '';

  await updateCalloutVisibility(
    whiteboardCollectionSubsubspaceCalloutId,
    CalloutVisibility.Published
  );
  await deleteMailSlurperMails();

  preferencesConfig = [
    {
      userID: TestUserManager.users.globalAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: TestUserManager.users.spaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: TestUserManager.users.subspaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: TestUserManager.users.subsubspaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: TestUserManager.users.spaceAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: TestUserManager.users.subspaceAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: TestUserManager.users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: TestUserManager.users.nonSpaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },
  ];
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Notifications - whiteboard', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  beforeAll(async () => {
    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'true')
    );
    await deleteMailSlurperMails();
  });

  test('GA create space whiteboard - GA(1), HA (2), HM(6) get notifications', async () => {
    const subjectTextAdmin = `${baseScenario.space.about.profile.displayName}: New Whiteboard created by admin`;
    const subjectTextMember = `${baseScenario.space.about.profile.displayName}: New Whiteboard created by admin, have a look!`;

    // Act
    const res = await createWhiteboardOnCallout(
      whiteboardCollectionSpaceCalloutId,
      TestUser.GLOBAL_ADMIN
    );
    spaceWhiteboardId =
      res?.data?.createContributionOnCallout?.whiteboard?.id ?? '';
    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(9);

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.globalAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.globalAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceMember.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subspaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subspaceMember.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceMember.email,
      ])
    );

    await deleteWhiteboard(spaceWhiteboardId);
  });

  test('HA create space whiteboard - GA(1), HA (1), HM(6) get notifications', async () => {
    const subjectTextAdmin = `${baseScenario.space.about.profile.displayName}: New Whiteboard created by space`;
    const subjectTextMember = `${baseScenario.space.about.profile.displayName}: New Whiteboard created by space, have a look!`;
    // Act
    const res = await createWhiteboardOnCallout(
      whiteboardCollectionSpaceCalloutId,
      TestUser.SPACE_ADMIN
    );
    spaceWhiteboardId =
      res?.data?.createContributionOnCallout?.whiteboard?.id ?? '';

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(9);

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.globalAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.globalAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceMember.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subspaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subspaceMember.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceMember.email,
      ])
    );
  });

  test('HA create subspace whiteboard - GA(1), HA (1), CA(1), CM(3),  get notifications', async () => {
    const subjectTextAdmin = `${baseScenario.subspace.about.profile.displayName}: New Whiteboard created by space`;
    const subjectTextMember = `${baseScenario.subspace.about.profile.displayName}: New Whiteboard created by space, have a look!`;
    // Act
    const res = await createWhiteboardOnCallout(
      whiteboardCollectionSubspaceCalloutId,
      TestUser.SPACE_ADMIN
    );
    spaceWhiteboardId =
      res?.data?.createContributionOnCallout?.whiteboard?.id ?? '';

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(7);

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.globalAdmin.email,
      ])
    );

    // Space admin does not reacive email as admin message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.globalAdmin.email,
      ])
    );

    // Space admin does not reacive email as member message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );

    // Space member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceMember.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.subspaceAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subspaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subspaceMember.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceMember.email,
      ])
    );
  });

  test('OM create subsubspace whiteboard - HA(2), CA(1), OA(2), OM(4), get notifications', async () => {
    const subjectTextAdmin = `${baseScenario.subsubspace.about.profile.displayName}: New Whiteboard created by subsubspace`;
    const subjectTextMember = `${baseScenario.subsubspace.about.profile.displayName}: New Whiteboard created by subsubspace, have a look!`;
    // Act
    const res = await createWhiteboardOnCallout(
      whiteboardCollectionSubsubspaceCalloutId,
      TestUser.SUBSUBSPACE_MEMBER
    );
    spaceWhiteboardId =
      res?.data?.createContributionOnCallout?.whiteboard?.id ?? '';

    await delay(6000);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(5);

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.globalAdmin.email,
      ])
    );

    // Space admin does not reacive email as admin message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.globalAdmin.email,
      ])
    );

    // Space admin does not reacive email as member message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceAdmin.email,
      ])
    );
    // Space member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.spaceMember.email,
      ])
    );

    // Subspace admin does not reacive email as admin message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.subspaceAdmin.email,
      ])
    );

    // Subspace member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subspaceMember.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [
        TestUserManager.users.subsubspaceAdmin.email,
      ])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceAdmin.email,
      ])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [
        TestUserManager.users.subsubspaceMember.email,
      ])
    );
  });

  test('OA create subsubspace whiteboard - 0 notifications - all roles with notifications disabled', async () => {
    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'false')
    );
    // Act
    const res = await createWhiteboardOnCallout(
      whiteboardCollectionSubsubspaceCalloutId,
      TestUser.SUBSUBSPACE_ADMIN
    );
    spaceWhiteboardId =
      res?.data?.createContributionOnCallout?.whiteboard?.id ?? '';

    // Assert
    await delay(1500);
    const mails = await getMailsData();

    expect(mails[1]).toEqual(0);
  });
});
