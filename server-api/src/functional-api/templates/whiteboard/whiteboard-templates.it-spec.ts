import '@utils/array.matcher';
import { UniqueIDGenerator } from '@alkemio/tests-lib';
import { GetTemplateById } from '@functional-api/templates/template.request.params';
import {
  createWhiteboardTemplate,
  getWhiteboardTemplatesCount,
} from './whiteboard-templates.request.params';
import { deleteTemplate } from '../template.request.params';
import { TestScenarioFactory } from '@src/models/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/models/types/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/models/test-scenario-config';

const uniqueId = UniqueIDGenerator.getID();
let postNameID = '';
let postDisplayName = '';
let templateId = '';

let baseScenario: OrganizationWithSpaceModel;

const scenarioConfig: TestScenarioConfig = {
  name: 'templates-whiteboard',
  space: {
    collaboration: {
      addCallouts: true,
    },
    subspace: {
      collaboration: {
        addCallouts: true,
      },
      subspace: {
        collaboration: {
          addCallouts: true,
        },
      },
    },
  },
};

beforeAll(async () => {
  baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);
});

afterAll(async () => {
  await TestScenarioFactory.cleanUpBaseScenario(baseScenario);
});

beforeEach(async () => {
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
    const countBefore = await getWhiteboardTemplatesCount(
      baseScenario.space.templateSetId
    );

    // Act
    const remove = await deleteTemplate(templateId);
    const countAfter = await getWhiteboardTemplatesCount(
      baseScenario.space.templateSetId
    );

    // Assert
    expect(countAfter).toEqual((countBefore as number) - 1);
    expect(remove?.data?.deleteTemplate.id).toEqual(templateId);
  });
});
