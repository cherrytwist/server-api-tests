import '../../../utils/array.matcher';
import { deleteSpace } from '../space/space.request.params';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { createOrgAndSpace } from '@utils/data-setup/entities';
import { entitiesId } from '@src/types/entities-helper';
import {
  createSubspace,
  getSubspaceData,
  getSubspacesData,
} from './subspace.request.params';
import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();

let subspaceName = '';
let subspaceId = '';
let additionalSubspaceId = '';
const organizationName = 'crechal-org-name' + uniqueId;
const hostNameId = 'crechal-org-nameid' + uniqueId;
const spaceName = 'crechal-eco-name' + uniqueId;
const spaceNameId = 'crechal-eco-nameid' + uniqueId;

const subspaceData = async (subspaceId: string) => {
  const subspaceData = await getSubspaceData(
    entitiesId.spaceId,
    subspaceId
  );
  return subspaceData;
};

const subspacesList = async () => {
  return await getSubspacesData(entitiesId.spaceId);
};

beforeAll(async () => {
  await createOrgAndSpace(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
});

afterAll(async () => {
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

beforeEach(async () => {
  subspaceName = `cr-ch-dname-${uniqueId}`;
  const response = await createSubspace(
    subspaceName + 'xxx',
    `cr-ch-nameid-${uniqueId}`,
    entitiesId.spaceId
  );
  subspaceId = response.data?.createSubspace.id ?? '';
});

afterEach(async () => {
  await deleteSpace(subspaceId);
});

describe('Create subspace', () => {
  test('should create a successfull subspace', async () => {
    // Act
    const response = await createSubspace(
      'subspaceName',
      `${uniqueId}cr`,
      entitiesId.spaceId
    );

    const createSubspaceData = response.data?.createSubspace;
    additionalSubspaceId = response.data?.createSubspace.id ?? '';

    // Assert
    expect(response.status).toBe(200);
    expect(createSubspaceData?.profile.displayName).toEqual('subspaceName');
    expect(createSubspaceData).toEqual(
      (await getSubspaceData(entitiesId.spaceId, additionalSubspaceId))
        .data?.space.subspace
    );
  });

  test('should remove a subspace', async () => {
    // Arrange
    const challangeDataBeforeRemove = await subspaceData(subspaceId);

    // Act
    const deleteSubspaceData = await deleteSpace(subspaceId);
    // Assert
    expect(deleteSubspaceData.status).toBe(200);
    expect(deleteSubspaceData.data?.deleteSpace.id).toEqual(subspaceId);

    expect((await subspacesList()).data?.space.subspaces).not.toContainObject(
      challangeDataBeforeRemove.data?.space.subspace
    );
  });

  // ToDo: unstable, passes randomly
  test.skip('should create 2 subspaces with different names and nameIDs', async () => {
    // Act
    const response = await createSubspace(
      `${subspaceName}cr23`,
      `${uniqueId}cr23`,
      entitiesId.spaceId
    );
    const subspaceId1 = response.data?.createSubspace.id ?? '';

    const responseSubspaceTwo = await createSubspace(
      //  spaceId,
      `${subspaceName}cc3`,
      `${uniqueId}cc3`,
      entitiesId.spaceId
    );
    const subspaceId2 = responseSubspaceTwo.data?.createSubspace.id ?? '';

    // Assert
    expect((await subspacesList()).data?.space.subspaces).toContainObject(
      (await subspaceData(subspaceId1)).data?.space.subspace
    );
    expect((await subspacesList()).data?.space.subspaces).toContainObject(
      (await subspaceData(subspaceId2)).data?.space.subspace
    );
    await deleteSpace(subspaceId1);
    await deleteSpace(subspaceId2);
  });

  describe('DDT invalid NameID', () => {
    //Arrange;
    test.each`
      nameId       | expected
      ${'d'}       | ${'NameID value format is not valid: d'}
      ${'vvv,vvd'} | ${'NameID value format is not valid: vvv,vvd'}
      ${'..-- d'}  | ${'NameID value format is not valid: ..-- d'}
    `(
      'should throw error: "$expected" for nameId value: "$nameId"',
      async ({ nameId, expected }) => {
        const response = await createSubspace(
          subspaceName + 'd',
          nameId + 'd',
          entitiesId.spaceId
        );

        // Assert
        expect(JSON.stringify(response)).toContain(expected);
      }
    );
  });
});
