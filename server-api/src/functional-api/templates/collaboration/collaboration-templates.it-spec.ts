import {
  createTemplateFromCollaboration,
  getCollaborationTemplatesCount,
  updateCollaborationTemplate,
} from './collaboration-template.request.params';
import { getCollaborationTemplatesCountForSpace } from './collaboration-template.request.params';
import { templateInfoUpdate } from './collaboration-template-testdata';
import { deleteTemplate, GetTemplateById } from '../template.request.params';
import { TestScenarioFactory } from '@src/scenario/TestScenarioFactory';
import { OrganizationWithSpaceModel } from '@src/scenario/models/OrganizationWithSpaceModel';
import { TestScenarioConfig } from '@src/scenario/config/test-scenario-config';

let templateId = '';

let baseScenario: OrganizationWithSpaceModel;
const scenarioConfig: TestScenarioConfig = {
  name: 'callouts',
  space: {
    collaboration: {
      addCallouts: true,
    },
    community: {
      addAdmin: true,
      addMembers: true,
    },
    subspace: {
      collaboration: {
        addCallouts: true,
      },
      community: {
        addAdmin: true,
        addMembers: true,
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

describe('Subspace templates - CRUD', () => {
  afterEach(async () => {
    await deleteTemplate(templateId);
  });

  test('Create subspace template', async () => {
    // Arrange

    const countBefore = await getCollaborationTemplatesCount(
      baseScenario.space.templateSetId
    );

    const res = await createTemplateFromCollaboration(
      baseScenario.subspace.collaboration.id,
      baseScenario.space.templateSetId,
      'Subspace Template 1'
    );
    const collaborationData = res?.data?.createTemplateFromCollaboration;
    templateId = collaborationData?.id ?? '';

    // Act
    const countAfter = await getCollaborationTemplatesCount(
      baseScenario.space.templateSetId
    );

    const getTemplate = await GetTemplateById(templateId);
    const templateData = getTemplate?.data?.lookup.template;

    // Assert
    expect(countAfter).toEqual((countBefore as number) + 1);
    expect(collaborationData).toEqual(
      expect.objectContaining({
        id: templateData?.id,
        type: templateData?.type,
      })
    );
  });

  test('Delete subspace template', async () => {
    // Arrange
    const countBefore = await getCollaborationTemplatesCountForSpace(
      baseScenario.space.id
    );
    const res = await createTemplateFromCollaboration(
      baseScenario.subspace.collaboration.id,
      baseScenario.space.templateSetId,
      'Subspace Template 2'
    );

    templateId = res?.data?.createTemplateFromCollaboration.id ?? '';

    // Act
    const resDeleteTemplate = await deleteTemplate(templateId);
    const countAfter = await getCollaborationTemplatesCountForSpace(
      baseScenario.space.id
    );

    // Assert
    expect(countAfter).toEqual(countBefore);
    expect(resDeleteTemplate?.data?.deleteTemplate.id).toEqual(templateId);
  });

  test('Update subspace template', async () => {
    // Arrange
    const res = await createTemplateFromCollaboration(
      baseScenario.subspace.collaboration.id,
      baseScenario.space.templateSetId,
      'Subspace Template 3'
    );
    const collaborationData = res?.data?.createTemplateFromCollaboration;
    templateId = collaborationData?.id ?? '';

    const resUpdateTemplate = await updateCollaborationTemplate(
      templateId,
      templateInfoUpdate
    );
    const resBaseData = resUpdateTemplate?.data?.updateTemplate;

    expect(resBaseData?.profile).toEqual(
      expect.objectContaining({
        displayName: templateInfoUpdate.displayName,
        description: templateInfoUpdate.description,
      })
    );
  });
});
