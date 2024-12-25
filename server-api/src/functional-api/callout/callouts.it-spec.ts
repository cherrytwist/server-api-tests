import '@utils/array.matcher';
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import {
  createCalloutOnCollaboration,
  deleteCallout,
  getCollaborationCalloutsData,
  updateCallout,
  updateCalloutVisibility,
} from './callouts.request.params';
import { TestUser } from '@alkemio/tests-lib';
import { CalloutState, CalloutType } from '@generated/alkemio-schema';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { getDataPerSpaceCallout } from './post/post.request.params';
import { CalloutVisibility } from '@generated/graphql';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';
import { OrganizationWithSpaceModelFactory } from '@src/models/OrganizationWithSpaceFactory';

const uniqueId = UniqueIDGenerator.getID();

let calloutDisplayName = '';
let calloutId = '';

let baseScenario: OrganizationWithSpaceModel;

beforeAll(async () => {
  baseScenario = await OrganizationWithSpaceModelFactory.createOrganizationWithSpace();
  await OrganizationWithSpaceModelFactory.createSubspace(baseScenario.space.id, 'post-subspace', baseScenario.subspace);
  await OrganizationWithSpaceModelFactory.createSubspace(baseScenario.subspace.id, 'post-subsubspace', baseScenario.subsubspace);
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

beforeEach(async () => {
  calloutDisplayName = `callout-d-name-${uniqueId}`;
});

describe('Callouts - CRUD', () => {
  afterEach(async () => {
    await deleteCallout(calloutId);
  });
  test('should create callout on space coollaboration', async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id
    );
    const calloutDataCreate = res.data?.createCalloutOnCollaboration;
    calloutId = calloutDataCreate?.id ?? '';

    const postsData = await getDataPerSpaceCallout(
      baseScenario.space.id,
      calloutId
    );
    const data = postsData?.data?.space.collaboration?.callouts?.[0];

    // Assert
    expect(data).toEqual(calloutDataCreate);
  });

  test('should update callout on space coollaboration', async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id,
      {
        framing: {
          profile: { displayName: calloutDisplayName },
        },
      }
    );
    calloutId = res?.data?.createCalloutOnCollaboration.id ?? '';

    const resUpdate = await updateCallout(
      calloutId,
      TestUser.GLOBAL_ADMIN,
      {
        framing: {
          profile: {
            displayName: calloutDisplayName + 'update',
            description: 'calloutDescription update',
          },
        },
        contributionPolicy: {
          state: CalloutState.Archived,
        },
      }
    );
    const calloutReq = await getDataPerSpaceCallout(
      baseScenario.space.id,
      calloutId
    );
    const calloutData = calloutReq.data?.space.collaboration?.callouts?.[0];

    // Assert
    expect(calloutData).toEqual(resUpdate?.data?.updateCallout);
  });

  test('should update callout visibility to Published', async () => {
    // Act
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

    await updateCalloutVisibility(
      calloutId,
      CalloutVisibility.Published
    );

    const calloutReq = await getDataPerSpaceCallout(
      baseScenario.space.id,
      calloutId
    );
    const calloutData = calloutReq.data?.space.collaboration?.callouts?.[0];
    // Assert
    expect(calloutData?.visibility).toEqual(CalloutVisibility.Published);
  });

  test('should delete callout on space coollaboration', async () => {
    // Arrange
    const res = await createCalloutOnCollaboration(
      baseScenario.space.collaboration.id
    );
    calloutId = res.data?.createCalloutOnCollaboration.id ?? '';
    const resCalloutDataBefore = await getCollaborationCalloutsData(
      baseScenario.space.collaboration.id
    );
    const calloutDataBefore =
      resCalloutDataBefore.data?.lookup.collaboration?.callouts ?? [];

    // Act
    await deleteCallout(calloutId);
    const resCalloutData = await getCollaborationCalloutsData(
      baseScenario.space.collaboration.id
    );
    const calloutData =
      resCalloutData.data?.lookup.collaboration?.callouts ?? [];

    // Assert
    expect(calloutData.length).toEqual(calloutDataBefore.length - 1);
    expect(calloutData).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          visibility: 'DRAFT',
        }),
      ])
    );
  });

  // test.skip('should read only callout from specified group', async () => {
  //   // Arrange
  //   await createCalloutOnCollaboration(baseScenario.space.collaboration.id, {
  //     profile: { displayName: 'callout 1' },
  //     group: 'COMMUNITY_GROUP_1',
  //   });
  //   await createCalloutOnCollaboration(baseScenario.space.collaboration.id, {
  //     profile: { displayName: 'callout 2' },
  //     group: 'COMMUNITY_GROUP_1',
  //   });

  //   await createCalloutOnCollaboration(baseScenario.space.collaboration.id, {
  //     profile: { displayName: 'callout 3' },
  //     group: 'COMMUNITY_GROUP_1',
  //   });

  //   await createCalloutOnCollaboration(baseScenario.space.collaboration.id, {
  //     profile: { displayName: 'callout 4' },
  //     group: 'CHALLENGES_GROUP_1',
  //   });

  //   // Act
  //   const calloutsReq = await getSpaceCalloutsFromGroups(baseScenario.space.id, [
  //     'COMMUNITY_GROUP_1',
  //     'COMMUNITY_GROUP_2',
  //   ]);

  //   const callouts = calloutsReq.body.data.space.collaboration.callouts;

  //   // Assert
  //   expect(callouts).toHaveLength(3);
  // });
});

describe('Callouts - AUTH Space', () => {
  describe('DDT user privileges to create callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    // Arrange
    test.each`
      userRole                 | message
      ${TestUser.GLOBAL_ADMIN} | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SPACE_ADMIN}    | ${'"data":{"createCalloutOnCollaboration"'}
    `(
      'User: "$userRole" get message: "$message", who intend to create callout',
      async ({ userRole, message }) => {
        // Act
        const res = await createCalloutOnCollaboration(
          baseScenario.space.collaboration.id,
          { type: CalloutType.Post },
          userRole
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Assert
        expect(JSON.stringify(res)).toContain(message);
      }
    );
  });

  describe('DDT user NO privileges to create callout', () => {
    // Arrange
    test.each`
      userRole                   | message
      ${TestUser.SPACE_MEMBER}     | ${'errors'}
      ${TestUser.NON_SPACE_MEMBER} | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to create callout',
      async ({ userRole, message }) => {
        // Act
        const res = await createCalloutOnCollaboration(
          baseScenario.space.collaboration.id,
          { type: CalloutType.Post },
          userRole
        );

        // Assert
        expect(JSON.stringify(res)).toContain(message);
      }
    );
  });

  describe('DDT user privileges to update callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    test.each`
      userRole                   | message
      ${TestUser.GLOBAL_ADMIN}   | ${'"data":{"updateCallout"'}
      ${TestUser.SPACE_ADMIN}      | ${'"data":{"updateCallout"'}
      ${TestUser.SPACE_MEMBER}     | ${'errors'}
      ${TestUser.NON_SPACE_MEMBER} | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to update callout',
      async ({ userRole, message }) => {
        const res = await createCalloutOnCollaboration(
          baseScenario.space.collaboration.id
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Act
        const resUpdate = await updateCallout(calloutId, userRole, {
          framing: {
            profile: {
              description: 'update',
            },
          },
          contributionPolicy: {
            state: CalloutState.Archived,
          },
        });

        // Assert
        expect(JSON.stringify(resUpdate)).toContain(message);
      }
    );
  });

  describe('DDT user privileges to delete callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    test.each`
      userRole                   | message
      ${TestUser.GLOBAL_ADMIN}   | ${'"data":{"deleteCallout"'}
      ${TestUser.SPACE_ADMIN}      | ${'"data":{"deleteCallout"'}
      ${TestUser.SPACE_MEMBER}     | ${'errors'}
      ${TestUser.NON_SPACE_MEMBER} | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to delete callout',
      async ({ userRole, message }) => {
        const res = await createCalloutOnCollaboration(
          baseScenario.space.collaboration.id
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Act
        const resDelete = await deleteCallout(calloutId, userRole);

        // Assert
        expect(JSON.stringify(resDelete)).toContain(message);
      }
    );
  });
});

describe('Callouts - AUTH Subspace', () => {
  describe('DDT user privileges to create callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    // Arrange
    test.each`
      userRole                     | message
      ${TestUser.SPACE_ADMIN}        | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SUBSPACE_ADMIN}  | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SUBSPACE_MEMBER} | ${'"data":{"createCalloutOnCollaboration"'}
    `(
      'User: "$userRole" get message: "$message", who intend to create callout',
      async ({ userRole, message }) => {
        // Act
        const res = await createCalloutOnCollaboration(
          baseScenario.subspace.collaboration.id,
          { type: CalloutType.Post },
          userRole
        );

        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Assert
        expect(JSON.stringify(res)).toContain(message);
      }
    );
  });

  describe('DDT user NO privileges to create callout', () => {
    // Arrange
    test.each`
      userRole                   | message
      ${TestUser.NON_SPACE_MEMBER} | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to create callout',
      async ({ userRole, message }) => {
        // Act
        const res = await createCalloutOnCollaboration(
          baseScenario.subspace.collaboration.id,
          { type: CalloutType.Post },
          userRole
        );

        // Assert
        expect(JSON.stringify(res)).toContain(message);
      }
    );
  });

  describe('DDT user privileges to update callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    test.each`
      userRole                     | message
      ${TestUser.SPACE_ADMIN}        | ${'"data":{"updateCallout"'}
      ${TestUser.SUBSPACE_ADMIN}  | ${'"data":{"updateCallout"'}
      ${TestUser.SUBSPACE_MEMBER} | ${'errors'}
      ${TestUser.NON_SPACE_MEMBER}   | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to update callout',
      async ({ userRole, message }) => {
        const res = await createCalloutOnCollaboration(
          baseScenario.subspace.collaboration.id
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Act
        const resUpdate = await updateCallout(calloutId, userRole, {
          framing: {
            profile: {
              description: ' update',
            },
          },
          contributionPolicy: {
            state: CalloutState.Archived,
          },
        });

        // Assert
        expect(JSON.stringify(resUpdate)).toContain(message);
      }
    );
  });

  describe('DDT user privileges to delete callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    test.each`
      userRole                     | message
      ${TestUser.SPACE_ADMIN}        | ${'"data":{"deleteCallout"'}
      ${TestUser.SUBSPACE_ADMIN}  | ${'"data":{"deleteCallout"'}
      ${TestUser.SUBSPACE_MEMBER} | ${'errors'}
      ${TestUser.NON_SPACE_MEMBER}   | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to delete callout',
      async ({ userRole, message }) => {
        const res = await createCalloutOnCollaboration(
          baseScenario.subspace.collaboration.id
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Act
        const resDelete = await deleteCallout(calloutId, userRole);

        // Assert
        expect(JSON.stringify(resDelete)).toContain(message);
      }
    );
  });
});

describe('Callouts - AUTH Subsubspace', () => {
  describe('DDT user privileges to create callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    // Arrange
    test.each`
      userRole                       | message
      ${TestUser.SPACE_ADMIN}          | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SUBSPACE_ADMIN}    | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SPACE_MEMBER}         | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SUBSPACE_MEMBER}   | ${'"data":{"createCalloutOnCollaboration"'}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${'"data":{"createCalloutOnCollaboration"'}
    `(
      'User: "$userRole" get message: "$message", who intend to create callout',
      async ({ userRole, message }) => {
        // Act
        const res = await createCalloutOnCollaboration(
          baseScenario.subsubspace.collaboration.id,
          { type: CalloutType.Post },
          userRole
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Assert
        expect(JSON.stringify(res)).toContain(message);
      }
    );
  });

  describe('DDT user NO privileges to create callout', () => {
    // Arrange
    test.each`
      userRole                   | message
      ${TestUser.NON_SPACE_MEMBER} | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to create callout',
      async ({ userRole, message }) => {
        // Act
        const res = await createCalloutOnCollaboration(
          baseScenario.subsubspace.collaboration.id,
          { type: CalloutType.Post },
          userRole
        );

        // Assert
        expect(JSON.stringify(res)).toContain(message);
      }
    );
  });

  describe('DDT user privileges to update callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    test.each`
      userRole                       | message
      ${TestUser.SPACE_ADMIN}          | ${'"data":{"updateCallout"'}
      ${TestUser.SUBSPACE_ADMIN}    | ${'"data":{"updateCallout"'}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${'"data":{"updateCallout"'}
      ${TestUser.SPACE_MEMBER}         | ${'errors'}
      ${TestUser.SUBSPACE_MEMBER}   | ${'errors'}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${'errors'}
      ${TestUser.NON_SPACE_MEMBER}     | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to update callout',
      async ({ userRole, message }) => {
        const res = await createCalloutOnCollaboration(
          baseScenario.subsubspace.collaboration.id
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Act
        const resUpdate = await updateCallout(calloutId, userRole, {
          framing: {
            profile: {
              displayName: calloutDisplayName + 'update',
              description: 'calloutDescription update',
            },
          },
          contributionPolicy: {
            state: CalloutState.Archived,
          },
        });

        // Assert
        expect(JSON.stringify(resUpdate)).toContain(message);
      }
    );
  });

  describe('DDT user privileges to delete callout', () => {
    afterEach(async () => {
      await deleteCallout(calloutId);
    });
    test.each`
      userRole                       | message
      ${TestUser.SPACE_ADMIN}          | ${'"data":{"deleteCallout"'}
      ${TestUser.SUBSPACE_ADMIN}    | ${'"data":{"deleteCallout"'}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${'"data":{"deleteCallout"'}
      ${TestUser.SPACE_MEMBER}         | ${'errors'}
      ${TestUser.SUBSPACE_MEMBER}   | ${'errors'}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${'errors'}
      ${TestUser.NON_SPACE_MEMBER}     | ${'errors'}
    `(
      'User: "$userRole" get message: "$message", who intend to delete callout',
      async ({ userRole, message }) => {
        const res = await createCalloutOnCollaboration(
          baseScenario.subsubspace.collaboration.id
        );
        calloutId = res.data?.createCalloutOnCollaboration.id ?? '';

        // Act
        const resDelete = await deleteCallout(calloutId, userRole);

        // Assert
        expect(JSON.stringify(resDelete)).toContain(message);
      }
    );
  });
});
