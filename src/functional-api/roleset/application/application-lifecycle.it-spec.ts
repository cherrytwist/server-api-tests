import '@utils/array.matcher';
import {
  deleteSpace,
  getSpaceData,
  updateSpaceSettings,
} from '@functional-api/journey/space/space.request.params';

import {
  deleteApplication,
  createApplication,
  getRoleSetInvitationsApplications,
} from '@functional-api/roleset/application/application.request.params';
import { uniqueId } from '@utils/uniqueId';
import { createOrgAndSpace } from '@utils/data-setup/entities';
import { entitiesId } from '../../../types/entities-helper';
import { deleteOrganization } from '../../contributor-management/organization/organization.request.params';
import { eventOnRoleSetApplication } from '../roleset-events.request.params';
import { CommunityMembershipPolicy } from '@generated/graphql';

let applicationId = '';
let applicationData;
let spaceRoleSetId = '';
const organizationName = 'life-org-name' + uniqueId;
const hostNameId = 'life-org-nameid' + uniqueId;
const spaceName = 'life-eco-name' + uniqueId;
const spaceNameId = 'life-eco-nameid' + uniqueId;

beforeAll(async () => {
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
});

afterAll(async () => {
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Lifecycle', () => {
  describe('Update application entity state - positive path - REJECT', () => {
    beforeAll(async () => {
      await updateSpaceSettings(entitiesId.spaceId, {
        membership: {
          policy: CommunityMembershipPolicy.Applications,
        },
      });

      const spaceCommunityIds = await getSpaceData(entitiesId.spaceId);
      spaceRoleSetId =
        spaceCommunityIds?.data?.space?.community?.roleSet.id ?? '';

      applicationData = await createApplication(spaceRoleSetId);
      applicationId =
        applicationData?.data?.applyForEntryRoleOnRoleSet?.id ?? '';
    });

    afterAll(async () => {
      await deleteApplication(applicationId);
    });

    // Arrange
    test.each`
      setEvent     | state         | nextEvents
      ${'REJECT'}  | ${'rejected'} | ${['REOPEN', 'ARCHIVE']}
      ${'REOPEN'}  | ${'new'}      | ${['APPROVE', 'REJECT']}
      ${'APPROVE'} | ${'approved'} | ${[]}
    `(
      'should update application, when set event: "$setEvent" to state: "$state", nextEvents: "$nextEvents"',
      async ({ setEvent, state, nextEvents }) => {
        // Act
        const eventResponseData = await eventOnRoleSetApplication(
          applicationId,
          setEvent
        );

        const application = eventResponseData?.data?.eventOnApplication;
        const roleSetPendingMemberships = await getRoleSetInvitationsApplications(
          entitiesId.space.roleSetId
        );

        const roleSetFirstApplication =
          roleSetPendingMemberships?.data?.lookup?.roleSet?.applications[0];
        if (!roleSetFirstApplication) {
          throw new Error('Role set application not found');
        }
          // Assert
        expect(application?.state).toEqual(state);
        expect(application?.nextEvents).toEqual(nextEvents);
        expect(application).toEqual(roleSetFirstApplication);
      }
    );
  });
});
