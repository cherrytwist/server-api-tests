/* eslint-disable quotes */
import { uniqueId } from '@utils/uniqueId';
import { TestUser } from '@common/enum/test.user';
import {
  deleteDocument,
  getProfileDocuments,
  uploadFileOnRef,
  uploadFileOnStorageBucket,
  uploadImageOnVisual,
} from '../upload.params';
import path from 'path';
import { deleteOrganization } from '../../contributor-management/organization/organization.request.params';
import { createOrgAndSpaceWithUsers } from '@utils/data-setup/entities';
import { lookupProfileVisuals } from '../../lookup/lookup-request.params';
import { deleteSpace } from '../../journey/space/space.request.params';
import {
  sorted__create_read_update_delete_grant,
  sorted__create_read_update_delete_grant_fileUp_fileDel,
  sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin,
  sorted__create_read_update_delete_grant_platformAdmin,
} from '@common/constants/privileges';
import { users } from '@utils/queries/users-data';
import { createReferenceOnProfile } from '../../references/references.request.params';
import { entitiesId } from '../../../types/entities-helper';
import { assignUserToOrganization } from '../../roleset/roles-request.params';
import { assignUserAsOrganizationAdmin, assignUserAsOrganizationOwner } from '@functional-api/contributor-management/organization/organization-authorization-mutation';

const organizationName = 'org-name' + uniqueId;
const hostNameId = 'org-nameid' + uniqueId;
const spaceName = 'lifec-eco-name' + uniqueId;
const spaceNameId = 'lifec-eco-nameid' + uniqueId;
let refId = '';

let documentId = '';

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );

  await assignUserAsOrganizationAdmin(
    users.challengeAdmin.id,
    entitiesId.organization.id
  );

  await assignUserAsOrganizationOwner(
    users.spaceAdmin.id,
    entitiesId.organization.id
  );

  await assignUserToOrganization(
    users.spaceMember.id,
    entitiesId.organization.id
  );
});
afterAll(async () => {
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Organization - documents', () => {
  describe('Access to Organization Profile visual', () => {
    afterAll(async () => {
      await deleteDocument(documentId);
    });
    beforeAll(async () => {
      const visualData = await lookupProfileVisuals(
        entitiesId.organization.profileId
      );
      const visualId = visualData.data?.lookup.profile?.visuals[0].id ?? '';
      await uploadImageOnVisual(
        path.join(__dirname, 'files-to-upload', '190-410.jpg'),
        visualId
      );
      const getDocId = await getProfileDocuments(
        entitiesId.organization.profileId,
        TestUser.GLOBAL_ADMIN
      );
      documentId =
        getDocId.data?.lookup?.profile?.storageBucket?.documents[0].id ?? '';
    });

    // Arrange
    test.each`
      userRole                    | privileges
      ${undefined}                | ${['READ']}
      ${TestUser.NON_HUB_MEMBER}  | ${['READ']}
      ${TestUser.GLOBAL_ADMIN}    | ${sorted__create_read_update_delete_grant_platformAdmin}
      ${TestUser.HUB_ADMIN}       | ${sorted__create_read_update_delete_grant}
      ${TestUser.CHALLENGE_ADMIN} | ${sorted__create_read_update_delete_grant}
      ${TestUser.HUB_MEMBER}      | ${['READ']}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization profile visual document',
      async ({ userRole, privileges }) => {
        const res = await getProfileDocuments(
          entitiesId.organization.profileId,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket?.documents[0];
        const dataAuthorization = data?.authorization;

        expect(dataAuthorization?.myPrivileges?.sort()).toEqual(privileges);
      }
    );

    test.each`
      userRole                    | privileges                                                                           | parentEntityType
      ${undefined}                | ${['READ']}                                                                          | ${'ORGANIZATION'}
      ${TestUser.NON_HUB_MEMBER}  | ${['READ']}                                                                          | ${'ORGANIZATION'}
      ${TestUser.GLOBAL_ADMIN}    | ${sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin}              | ${'ORGANIZATION'}
      ${TestUser.HUB_ADMIN}       | ${sorted__create_read_update_delete_grant_fileUp_fileDel}                            | ${'ORGANIZATION'}
      ${TestUser.CHALLENGE_ADMIN} | ${sorted__create_read_update_delete_grant_fileUp_fileDel}                            | ${'ORGANIZATION'}
      ${TestUser.HUB_MEMBER}      | ${['READ']}                                                                          | ${'ORGANIZATION'}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization profile storage bucket',
      async ({
        userRole,
        privileges,
        parentEntityType,
      }) => {
        const res = await getProfileDocuments(
          entitiesId.organization.profileId,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket;

        expect(data?.authorization?.myPrivileges?.sort()).toEqual(privileges);
        expect(data?.parentEntity?.type).toEqual(parentEntityType);
      }
    );
  });

  describe('Access to Organization Profile reference document', () => {
    afterAll(async () => {
      await deleteDocument(documentId);
    });
    beforeAll(async () => {
      const refData = await createReferenceOnProfile(
        entitiesId.organization.profileId
      );
      refId = refData?.data?.createReferenceOnProfile?.id ?? '';
      await uploadFileOnRef(
        path.join(__dirname, 'files-to-upload', 'image.png'),
        refId
      );

      const getDocId = await getProfileDocuments(
        entitiesId.organization.profileId,
        TestUser.GLOBAL_ADMIN
      );
      documentId =
        getDocId.data?.lookup?.profile?.storageBucket?.documents[0].id ?? '';
    });

    // Arrange
    test.each`
      userRole                    | privileges
      ${undefined}                | ${['READ']}
      ${TestUser.NON_HUB_MEMBER}  | ${['READ']}
      ${TestUser.GLOBAL_ADMIN}    | ${sorted__create_read_update_delete_grant_platformAdmin}
      ${TestUser.HUB_ADMIN}       | ${sorted__create_read_update_delete_grant}
      ${TestUser.CHALLENGE_ADMIN} | ${sorted__create_read_update_delete_grant}
      ${TestUser.HUB_MEMBER}      | ${['READ']}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization reference document',
      async ({ userRole, privileges }) => {
        const res = await getProfileDocuments(
          entitiesId.organization.profileId,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket?.documents[0];
        const dataAuthorization = data?.authorization;

        expect(dataAuthorization?.myPrivileges?.sort()).toEqual(privileges);
      }
    );

    test.each`
      userRole                    | privileges                                                                           | parentEntityType
      ${undefined}                | ${['READ']}                                                                          | ${'ORGANIZATION'}
      ${TestUser.NON_HUB_MEMBER}  | ${['READ']}                                                                          | ${'ORGANIZATION'}
      ${TestUser.GLOBAL_ADMIN}    | ${sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin}              | ${'ORGANIZATION'}
      ${TestUser.HUB_ADMIN}       | ${sorted__create_read_update_delete_grant_fileUp_fileDel}                            | ${'ORGANIZATION'}
      ${TestUser.CHALLENGE_ADMIN} | ${sorted__create_read_update_delete_grant_fileUp_fileDel}                            | ${'ORGANIZATION'}
      ${TestUser.HUB_MEMBER}      | ${['READ']}                                                                          | ${'ORGANIZATION'}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization profile reference storage bucket',
      async ({
        userRole,
        privileges,
        parentEntityType,
      }) => {
        const res = await getProfileDocuments(
          entitiesId.organization.profileId,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket;

        expect(data?.authorization?.myPrivileges?.sort()).toEqual(privileges);
        expect(data?.parentEntity?.type).toEqual(parentEntityType);
      }
    );
  });

  describe('Access to Organization storage bucket', () => {
    afterAll(async () => {
      await deleteDocument(documentId);
    });
    beforeAll(async () => {
      const getSpaceStorageId = await getProfileDocuments(
        entitiesId.organization.profileId,
        TestUser.GLOBAL_ADMIN
      );

      const storageId =
        getSpaceStorageId.data?.lookup?.profile?.storageBucket?.id ?? '';

      await uploadFileOnStorageBucket(
        path.join(__dirname, 'files-to-upload', 'image.png'),
        storageId
      );

      const getDocId = await getProfileDocuments(
        entitiesId.space.profileId,
        TestUser.GLOBAL_ADMIN
      );

      documentId =
        getDocId.data?.lookup?.profile?.storageBucket?.documents[0].id ?? '';
    });

    // Arrange
    test.each`
      userRole                    | privileges
      ${undefined}                | ${['READ']}
      ${TestUser.NON_HUB_MEMBER}  | ${['READ']}
      ${TestUser.GLOBAL_ADMIN}    | ${sorted__create_read_update_delete_grant_platformAdmin}
      ${TestUser.HUB_ADMIN}       | ${sorted__create_read_update_delete_grant}
      ${TestUser.CHALLENGE_ADMIN} | ${sorted__create_read_update_delete_grant}
      ${TestUser.HUB_MEMBER}      | ${['READ']}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization description visual document',
      async ({ userRole, privileges }) => {
        const res = await getProfileDocuments(
          entitiesId.organization.profileId,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket?.documents[0];
        const dataAuthorization = data?.authorization;

        expect(dataAuthorization?.myPrivileges?.sort()).toEqual(privileges);
      }
    );

    test.each`
      userRole                    | privileges                                                                           | parentEntityType
      ${undefined}                | ${['READ']}                                                                          | ${'ORGANIZATION'}
      ${TestUser.NON_HUB_MEMBER}  | ${['READ']}                                                                          | ${'ORGANIZATION'}
      ${TestUser.GLOBAL_ADMIN}    | ${sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin}              | ${'ORGANIZATION'}
      ${TestUser.HUB_ADMIN}       | ${sorted__create_read_update_delete_grant_fileUp_fileDel}                            | ${'ORGANIZATION'}
      ${TestUser.CHALLENGE_ADMIN} | ${sorted__create_read_update_delete_grant_fileUp_fileDel}                            | ${'ORGANIZATION'}
      ${TestUser.HUB_MEMBER}      | ${['READ']}                                                                          | ${'ORGANIZATION'}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization description (storageBucket) document',
      async ({
        userRole,
        privileges,
        parentEntityType,
      }) => {
        const res = await getProfileDocuments(
          entitiesId.organization.profileId,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket;

        expect(data?.authorization?.myPrivileges?.sort()).toEqual(privileges);
        expect(data?.parentEntity?.type).toEqual(parentEntityType);
      }
    );
  });
});
