import '@utils/array.matcher';
import { deleteSpace } from '@functional-api/journey/space/space.request.params';
import { UniqueIDGenerator } from '@alkemio/tests-lib';;
const uniqueId = UniqueIDGenerator.getID();
import {
  createSubspaceForOrgSpace,
  createSubsubspaceForSubspace,
  createOrgAndSpace,
} from '@utils/data-setup/entities';
import { GetTemplateById } from '@functional-api/templates/template.request.params';
import { deleteOrganization } from '@functional-api/contributor-management/organization/organization.request.params';
import { baseScenario } from '@src/types/entities-helper';
import {
  createWhiteboardTemplate,
  getWhiteboardTemplatesCount,
} from './whiteboard-templates.request.params';
import { deleteTemplate } from '../template.request.params';

let subsubspaceName = 'post-opp';
let subspaceName = 'post-chal';
let postNameID = '';
let postDisplayName = '';
const organizationName = 'post-org-name' + uniqueId;
const hostNameId = 'post-org-nameid' + uniqueId;
const spaceName = 'post-eco-name' + uniqueId;
const spaceNameId = 'post-eco-nameid' + uniqueId;
let templateId = '';

beforeAll(async () => {
  await createOrgAndSpace(organizationName, hostNameId, spaceName, spaceNameId);
  await createSubspaceForOrgSpace(subspaceName);
  await createSubsubspaceForSubspace(subsubspaceName);
});

afterAll(async () => {
  await deleteSpace(baseScenario.subsubspace.id);
  await deleteSpace(baseScenario.subspace.id);
  await deleteSpace(baseScenario.space.id);
  await deleteOrganization(baseScenario.organization.id);
});

beforeEach(async () => {
  subspaceName = `testSubspace ${uniqueId}`;
  subsubspaceName = `subsubspaceName ${uniqueId}`;
  postNameID = `post-name-id-${uniqueId}`;
  postDisplayName = `post-d-name-${uniqueId}`;
});

describe('WHITEBOARD templates - CRUD', () => {
  afterEach(async () => {
    await deleteTemplate(templateId);
  });
  test('Create Whiteboard template', async () => {
    // Arrange
    const countBefore = await getWhiteboardTemplatesCount(
      baseScenario.space.templateSetId
    );
    // Act
    const resCreateTemplate = await createWhiteboardTemplate(
      baseScenario.space.templateSetId
    );
    const whiteboardData = resCreateTemplate?.data?.createTemplate;
    templateId = whiteboardData?.id ?? '';
    const countAfter = await getWhiteboardTemplatesCount(
      baseScenario.space.templateSetId
    );

    const getTemplate = await GetTemplateById(templateId);
    const templateData = getTemplate?.data?.lookup.template;

    // Assert
    expect(countAfter).toEqual((countBefore as number) + 1);
    expect(whiteboardData).toEqual(
      expect.objectContaining({
        id: templateData?.id,
        type: templateData?.type,
      })
    );
  });

  test('Delete Whiteboard template', async () => {
    // Arrange
    const resCreatePostTempl = await createWhiteboardTemplate(
      baseScenario.space.templateSetId
    );
    templateId = resCreatePostTempl?.data?.createTemplate.id ?? '';
    const countBefore = await getWhiteboardTemplatesCount(baseScenario.space.templateSetId);

    // Act
    const remove = await deleteTemplate(templateId);
    const countAfter = await getWhiteboardTemplatesCount(baseScenario.space.templateSetId);

    // Assert
    expect(countAfter).toEqual((countBefore as number) - 1);
    expect(remove?.data?.deleteTemplate.id).toEqual(templateId);
  });
});
