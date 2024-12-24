import { UniqueIDGenerator } from '@utils/uniqueId';
const uniqueId = UniqueIDGenerator.getID();
import { TestUser } from '@alkemio/tests-lib';
import { deleteMailSlurperMails } from '@utils/mailslurper.rest.requests';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { delay } from '@alkemio/tests-lib';
import { users } from '@utils/queries/users-data';
import {
  createWhiteboardCalloutOnCollaboration,
  updateCalloutVisibility,
} from '@functional-api/callout/callouts.request.params';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { createWhiteboardOnCallout } from '@functional-api/callout/call-for-whiteboards/whiteboard-collection-callout.params.request';
import { deleteWhiteboard } from '@functional-api/callout/whiteboard/whiteboard-callout.params.request';

import {
  CalloutType,
  CalloutVisibility,
  PreferenceType,
} from '@generated/alkemio-schema';
import { entitiesId, getMailsData } from '@src/types/entities-helper';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { changePreferenceUser } from '@functional-api/contributor-management/user/user-preferences-mutation';

const organizationName = 'not-up-org-name' + uniqueId;
const hostNameId = 'not-up-org-nameid' + uniqueId;
const spaceName = 'not-up-eco-name' + uniqueId;
const spaceNameId = 'not-up-eco-nameid' + uniqueId;
const subspaceName = `chName${uniqueId}`;
const subsubspaceName = `opName${uniqueId}`;
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

beforeAll(async () => {
  await deleteMailSlurperMails();

  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createSubspaceWithUsers(subspaceName);
  await createSubsubspaceWithUsers(subsubspaceName);
  const resSpace = await createWhiteboardCalloutOnCollaboration(
    entitiesId.space.collaborationId,
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
    resSpace?.data?.createCalloutOnCollaboration.id ?? '';

  await updateCalloutVisibility(
    whiteboardCollectionSpaceCalloutId,
    CalloutVisibility.Published
  );

  const resSubspace = await createWhiteboardCalloutOnCollaboration(
    entitiesId.subspace.collaborationId,
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
    resSubspace?.data?.createCalloutOnCollaboration.id ?? '';

  await updateCalloutVisibility(
    whiteboardCollectionSubspaceCalloutId,
    CalloutVisibility.Published
  );

  const resSubsubspace = await createWhiteboardCalloutOnCollaboration(
    entitiesId.subsubspace.collaborationId,
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
    resSubsubspace?.data?.createCalloutOnCollaboration.id ?? '';

  await updateCalloutVisibility(
    whiteboardCollectionSubsubspaceCalloutId,
    CalloutVisibility.Published
  );
  await deleteMailSlurperMails();

  preferencesConfig = [
    {
      userID: users.globalAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: users.spaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: users.subspaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: users.subsubspaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: users.spaceAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: users.subspaceAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: users.subsubspaceAdmin.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },

    {
      userID: users.nonSpaceMember.id,
      type: PreferenceType.NotificationWhiteboardCreated,
    },
  ];
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Notifications - whiteboard', () => {
  beforeEach(async () => {
    await deleteMailSlurperMails();
  });

  beforeAll(async () => {
    await changePreferenceUser(
      users.notificationsAdmin.id,
      PreferenceType.NotificationWhiteboardCreated,
      'false'
    );
    preferencesConfig.forEach(
      async config =>
        await changePreferenceUser(config.userID, config.type, 'true')
    );
    await deleteMailSlurperMails();
  });

  // ToDo: fix test
  test.skip('GA create space whiteboard - GA(1), HA (2), HM(6) get notifications', async () => {
    const subjectTextAdmin = `${spaceName}: New Whiteboard created by admin`;
    const subjectTextMember = `${spaceName}: New Whiteboard created by admin, have a look!`;

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
      await expectedDataFunc(subjectTextAdmin, [users.globalAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [users.spaceAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.globalAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceMember.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subspaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceMember.email])
    );

    await deleteWhiteboard(spaceWhiteboardId);
  });

  // ToDo: fix test
  test.skip('HA create space whiteboard - GA(1), HA (1), HM(6) get notifications', async () => {
    const subjectTextAdmin = `${spaceName}: New Whiteboard created by space`;
    const subjectTextMember = `${spaceName}: New Whiteboard created by space, have a look!`;
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
      await expectedDataFunc(subjectTextAdmin, [users.globalAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [users.spaceAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.globalAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceMember.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subspaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceMember.email])
    );
  });

  test('HA create subspace whiteboard - GA(1), HA (1), CA(1), CM(3),  get notifications', async () => {
    const subjectTextAdmin = `${subspaceName}: New Whiteboard created by space`;
    const subjectTextMember = `${subspaceName}: New Whiteboard created by space, have a look!`;
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
      await expectedDataFunc(subjectTextAdmin, [users.globalAdmin.email])
    );

    // Space admin does not reacive email as admin message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextAdmin, [users.spaceAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.globalAdmin.email])
    );

    // Space admin does not reacive email as member message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceAdmin.email])
    );

    // Space member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceMember.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [users.subspaceAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subspaceMember.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceMember.email])
    );
  });

  test('OM create subsubspace whiteboard - HA(2), CA(1), OA(2), OM(4), get notifications', async () => {
    const subjectTextAdmin = `${subsubspaceName}: New Whiteboard created by subsubspace`;
    const subjectTextMember = `${subsubspaceName}: New Whiteboard created by subsubspace, have a look!`;
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
      await expectedDataFunc(subjectTextAdmin, [users.globalAdmin.email])
    );

    // Space admin does not reacive email as admin message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextAdmin, [users.spaceAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.globalAdmin.email])
    );

    // Space admin does not reacive email as member message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceAdmin.email])
    );
    // Space member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [users.spaceMember.email])
    );

    // Subspace admin does not reacive email as admin message
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextAdmin, [users.subspaceAdmin.email])
    );

    // Subspace member does not reacive email
    expect(mails[0]).not.toEqual(
      await expectedDataFunc(subjectTextMember, [users.subspaceMember.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextAdmin, [users.subsubspaceAdmin.email])
    );

    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceAdmin.email])
    );
    expect(mails[0]).toEqual(
      await expectedDataFunc(subjectTextMember, [users.subsubspaceMember.email])
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
