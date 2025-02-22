import { TestUser } from '@alkemio/tests-lib';
import {
  deleteDocument,
  getProfileDocuments,
  uploadFileOnRef,
  uploadFileOnStorageBucket,
  uploadImageOnVisual,
} from '../upload.params';
import path from 'path';
import { lookupProfileVisuals } from '../../lookup/lookup-request.params';
import {
  sorted__create_read_update_delete_grant,
  sorted__create_read_update_delete_grant_fileUp_fileDel,
  sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin,
  sorted__create_read_update_delete_grant_platformAdmin,
} from '@common/constants/privileges';
import { TestUserManager } from '@src/scenario/TestUserManager';
import { createReferenceOnProfile } from '../../references/references.request.params';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';
import { RoleName } from '@generated/alkemio-schema';
import { assignRoleToUser } from '@functional-api/roleset/roles-request.params';

let refId = '';

let documentId = '';

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'storage-auth-organization-document',
};
beforeAll(async () => {
  baseScenario = await TestScenarioFactory.createBaseScenario(scenarioConfig);

  await assignRoleToUser(
    TestUserManager.users.subspaceAdmin.id,
    baseScenario.organization.roleSetId,
    RoleName.Admin
  );

  await assignRoleToUser(
    TestUserManager.users.spaceAdmin.id,
    baseScenario.organization.roleSetId,
    RoleName.Admin
  );

  await assignRoleToUser(
    TestUserManager.users.spaceMember.id,
    baseScenario.organization.roleSetId,
    RoleName.Associate
  );
});
afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

describe('Organization - documents', () => {
  describe('Access to Organization Profile visual', () => {
    afterAll(async () => {
      await deleteDocument(documentId);
    });
    beforeAll(async () => {
      const visualData = await lookupProfileVisuals(
        baseScenario.organization.profile.id
      );
      const visualId = visualData.data?.lookup.profile?.visuals[0].id ?? '';
      await uploadImageOnVisual(
        path.join(__dirname, 'files-to-upload', '190-410.jpg'),
        visualId
      );
      const getDocId = await getProfileDocuments(
        baseScenario.organization.profile.id,
        TestUser.GLOBAL_ADMIN
      );
      documentId =
        getDocId.data?.lookup?.profile?.storageBucket?.documents[0].id ?? '';
    });

    // Arrange
    test.each`
      userRole                     | privileges
      ${undefined}                 | ${['READ']}
      ${TestUser.NON_SPACE_MEMBER} | ${['READ']}
      ${TestUser.GLOBAL_ADMIN}     | ${sorted__create_read_update_delete_grant_platformAdmin}
      ${TestUser.SPACE_ADMIN}      | ${sorted__create_read_update_delete_grant}
      ${TestUser.SUBSPACE_ADMIN}   | ${sorted__create_read_update_delete_grant}
      ${TestUser.SPACE_MEMBER}     | ${['READ']}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization profile visual document',
      async ({ userRole, privileges }) => {
        const res = await getProfileDocuments(
          baseScenario.organization.profile.id,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket?.documents[0];
        const dataAuthorization = data?.authorization;

        expect(dataAuthorization?.myPrivileges?.sort()).toEqual(privileges);
      }
    );

    test.each`
      userRole                     | privileges                                                              | parentEntityType
      ${undefined}                 | ${['READ']}                                                             | ${'ORGANIZATION'}
      ${TestUser.NON_SPACE_MEMBER} | ${['READ']}                                                             | ${'ORGANIZATION'}
      ${TestUser.GLOBAL_ADMIN}     | ${sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin} | ${'ORGANIZATION'}
      ${TestUser.SPACE_ADMIN}      | ${sorted__create_read_update_delete_grant_fileUp_fileDel}               | ${'ORGANIZATION'}
      ${TestUser.SUBSPACE_ADMIN}   | ${sorted__create_read_update_delete_grant_fileUp_fileDel}               | ${'ORGANIZATION'}
      ${TestUser.SPACE_MEMBER}     | ${['READ']}                                                             | ${'ORGANIZATION'}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization profile storage bucket',
      async ({ userRole, privileges, parentEntityType }) => {
        const res = await getProfileDocuments(
          baseScenario.organization.profile.id,
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
        baseScenario.organization.profile.id
      );
      refId = refData?.data?.createReferenceOnProfile?.id ?? '';
      await uploadFileOnRef(
        path.join(__dirname, 'files-to-upload', 'image.png'),
        refId
      );

      const getDocId = await getProfileDocuments(
        baseScenario.organization.profile.id,
        TestUser.GLOBAL_ADMIN
      );
      documentId =
        getDocId.data?.lookup?.profile?.storageBucket?.documents[0].id ?? '';
    });

    // Arrange
    test.each`
      userRole                     | privileges
      ${undefined}                 | ${['READ']}
      ${TestUser.NON_SPACE_MEMBER} | ${['READ']}
      ${TestUser.GLOBAL_ADMIN}     | ${sorted__create_read_update_delete_grant_platformAdmin}
      ${TestUser.SPACE_ADMIN}      | ${sorted__create_read_update_delete_grant}
      ${TestUser.SUBSPACE_ADMIN}   | ${sorted__create_read_update_delete_grant}
      ${TestUser.SPACE_MEMBER}     | ${['READ']}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization reference document',
      async ({ userRole, privileges }) => {
        const res = await getProfileDocuments(
          baseScenario.organization.profile.id,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket?.documents[0];
        const dataAuthorization = data?.authorization;

        expect(dataAuthorization?.myPrivileges?.sort()).toEqual(privileges);
      }
    );

    test.each`
      userRole                     | privileges                                                              | parentEntityType
      ${undefined}                 | ${['READ']}                                                             | ${'ORGANIZATION'}
      ${TestUser.NON_SPACE_MEMBER} | ${['READ']}                                                             | ${'ORGANIZATION'}
      ${TestUser.GLOBAL_ADMIN}     | ${sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin} | ${'ORGANIZATION'}
      ${TestUser.SPACE_ADMIN}      | ${sorted__create_read_update_delete_grant_fileUp_fileDel}               | ${'ORGANIZATION'}
      ${TestUser.SUBSPACE_ADMIN}   | ${sorted__create_read_update_delete_grant_fileUp_fileDel}               | ${'ORGANIZATION'}
      ${TestUser.SPACE_MEMBER}     | ${['READ']}                                                             | ${'ORGANIZATION'}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization profile reference storage bucket',
      async ({ userRole, privileges, parentEntityType }) => {
        const res = await getProfileDocuments(
          baseScenario.organization.profile.id,
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
        baseScenario.organization.profile.id,
        TestUser.GLOBAL_ADMIN
      );

      const storageId =
        getSpaceStorageId.data?.lookup?.profile?.storageBucket?.id ?? '';

      await uploadFileOnStorageBucket(
        path.join(__dirname, 'files-to-upload', 'image.png'),
        storageId
      );

      const getDocId = await getProfileDocuments(
        baseScenario.space.about.profile.id,
        TestUser.GLOBAL_ADMIN
      );

      documentId =
        getDocId.data?.lookup?.profile?.storageBucket?.documents[0].id ?? '';
    });

    // Arrange
    test.each`
      userRole                     | privileges
      ${undefined}                 | ${['READ']}
      ${TestUser.NON_SPACE_MEMBER} | ${['READ']}
      ${TestUser.GLOBAL_ADMIN}     | ${sorted__create_read_update_delete_grant_platformAdmin}
      ${TestUser.SPACE_ADMIN}      | ${sorted__create_read_update_delete_grant}
      ${TestUser.SUBSPACE_ADMIN}   | ${sorted__create_read_update_delete_grant}
      ${TestUser.SPACE_MEMBER}     | ${['READ']}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization description visual document',
      async ({ userRole, privileges }) => {
        const res = await getProfileDocuments(
          baseScenario.organization.profile.id,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket?.documents[0];
        const dataAuthorization = data?.authorization;

        expect(dataAuthorization?.myPrivileges?.sort()).toEqual(privileges);
      }
    );

    test.each`
      userRole                     | privileges                                                              | parentEntityType
      ${undefined}                 | ${['READ']}                                                             | ${'ORGANIZATION'}
      ${TestUser.NON_SPACE_MEMBER} | ${['READ']}                                                             | ${'ORGANIZATION'}
      ${TestUser.GLOBAL_ADMIN}     | ${sorted__create_read_update_delete_grant_fileUp_fileDel_platformAdmin} | ${'ORGANIZATION'}
      ${TestUser.SPACE_ADMIN}      | ${sorted__create_read_update_delete_grant_fileUp_fileDel}               | ${'ORGANIZATION'}
      ${TestUser.SUBSPACE_ADMIN}   | ${sorted__create_read_update_delete_grant_fileUp_fileDel}               | ${'ORGANIZATION'}
      ${TestUser.SPACE_MEMBER}     | ${['READ']}                                                             | ${'ORGANIZATION'}
    `(
      'User: "$userRole" has this privileges: "$privileges" to organization description (storageBucket) document',
      async ({ userRole, privileges, parentEntityType }) => {
        const res = await getProfileDocuments(
          baseScenario.organization.profile.id,
          userRole
        );
        const data = res.data?.lookup?.profile?.storageBucket;

        expect(data?.authorization?.myPrivileges?.sort()).toEqual(privileges);
        expect(data?.parentEntity?.type).toEqual(parentEntityType);
      }
    );
  });
});
