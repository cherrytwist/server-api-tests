import {
  createOrganizationMutation,
  deleteOrganizationMutation,
  hostNameId,
  organizationName,
  updateOrganizationMutation,
} from '@test/functional-api/integration/organization/organization.request.params';

const legalEntityName = 'Legal alkemio';
const domain = 'alkem.io';
const website = 'alkem.io';
const contactEmail = 'contact@alkem.io';

describe('Organization', () => {
  let orgId = '';
  beforeAll(async () => {
    const res = await createOrganizationMutation(organizationName, hostNameId);
    orgId = res.body.data.createOrganization.id;
  });
  afterAll(async () => await deleteOrganizationMutation(orgId));

  describe('create', () => {
    test('should create', async () => {
      const res = await createOrganizationMutation(
        organizationName + '1',
        hostNameId + '2',
        legalEntityName,
        domain,
        website,
        contactEmail
      );

      const data = res.body.data.createOrganization;
      const testOrgId = data.id;

      expect(res.status).toBe(200);
      expect(data).toMatchObject({
        id: testOrgId,
        displayName: organizationName + '1',
        nameID: hostNameId + '2',
        legalEntityName: legalEntityName,
        domain: domain,
        website: website,
        contactEmail: contactEmail,
      });

      await deleteOrganizationMutation(testOrgId);
    });

    test('should FAIL on breaking unique nameID', async () => {
      // we already created such with the same nameID
      const res = await createOrganizationMutation(
        organizationName + '1',
        hostNameId
      );

      expect(res.status).toBe(200);
      expect(res.body.errors[0].message).toBe(`Organization: the provided nameID is already taken: ${hostNameId}`);
    });

    test('should FAIL on breaking unique displayName', async () => {
      // we already created such with the same displayName
      const res = await createOrganizationMutation(
        organizationName,
        hostNameId + '1'
      );

      expect(res.status).toBe(200);
      expect(res.body.errors[0].message).toBe(`Organization: the provided displayName is already taken: ${organizationName}`);
    });
  });

  describe('update', () => {
    let updateOrganizationId = '';
    beforeAll(async () => {
      const res = await createOrganizationMutation(
        organizationName + '-update',
        hostNameId + '-update'
      );
      updateOrganizationId = res.body.data.createOrganization.id;
    });
    afterAll(
      async () => await deleteOrganizationMutation(updateOrganizationId));

    test('should update', async () => {
      const res = await updateOrganizationMutation(
        updateOrganizationId,
        organizationName + '1',
        legalEntityName + '2',
        domain + '3',
        website + '4',
        contactEmail + '5'
      );

      const data = res.body.data.updateOrganization;

      expect(data).toMatchObject({
        id: updateOrganizationId,
        nameID: hostNameId + '-update',
        displayName: organizationName + '1',
        legalEntityName: legalEntityName + '2',
        domain: domain + '3',
        website: website + '4',
        contactEmail: contactEmail + '5',
      });
    });

    test('should FAIL on breaking unique displayName', async () => {
      const res = await updateOrganizationMutation(
        updateOrganizationId,
        organizationName
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.errors[0].message).toBe(`Organization: the provided displayName is already taken: ${organizationName}`);
    });
  });

  describe('delete', () => {
    let deleteOrganizationId = '';
    beforeAll(async () => {
      const res = await createOrganizationMutation(
        organizationName + '-delete',
        hostNameId + '-delete'
      );
      deleteOrganizationId = res.body.data.createOrganization.id;
    });
    test('should delete', async () => {
      const res = await deleteOrganizationMutation(deleteOrganizationId);
      const data = res.body.data.deleteOrganization;

      expect(data).toMatchObject({ id: deleteOrganizationId });
    });

    test('should FAIL on unknown id', async () => {
      const mockId = 'mockid';
      const res = await deleteOrganizationMutation(mockId);

      expect(res.statusCode).toBe(200);
      expect(res.body.errors[0].message).toBe(`Unable to find Organization with ID: ${mockId}`);
    });
  });
});