import { deleteSpace } from '../../journey/space/space.request.params';
import { deleteOrganization } from '../../contributor-management/organization/organization.request.params';
import { entitiesId } from '../../../types/entities-helper';
import { uniqueId } from '@utils/mutations/create-mutation';
import {
  createOrgAndSpaceWithUsers,
  createChallengeForOrgSpace,
} from '../../../utils/data-setup/entities';
import {
  createTemplateFromCollaboration,
  getCollaborationTemplatesCount,
  updateCollaborationTemplate,
} from './collaboration-template.request.params';
import { getCollaborationTemplatesCountForSpace } from './collaboration-template.request.params';
import { templateInfoUpdate } from './collaboration-template-testdata';
import { deleteTemplate, GetTemplateById } from '../template.request.params';

const organizationName = 'lifec-org-name' + uniqueId;
const hostNameId = 'lifec-org-nameid' + uniqueId;
const spaceName = 'lifec-eco-name' + uniqueId;
const spaceNameId = 'lifec-eco-nameid' + uniqueId;
const subspaceName = 'subspaceName' + uniqueId;
let templateId = '';
beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createChallengeForOrgSpace(subspaceName);
});

afterAll(async () => {
  await deleteSpace(entitiesId.challenge.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteOrganization(entitiesId.organization.id);
});

describe('Subspace templates - CRUD', () => {
  afterEach(async () => {
    await deleteTemplate(templateId);
  });

  test('Create subspace template', async () => {
    // Arrange

    const countBefore = await getCollaborationTemplatesCount(
      entitiesId.space.templateSetId
    );

    const res = await createTemplateFromCollaboration(
      entitiesId.challenge.collaborationId,
      entitiesId.space.templateSetId,
      'Subspace Template 1'
    );
    const collaborationData = res?.data?.createTemplateFromCollaboration;
    templateId = collaborationData?.id ?? '';

    // Act
    const countAfter = await getCollaborationTemplatesCount(
      entitiesId.space.templateSetId
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
      entitiesId.spaceId
    );
    const res = await createTemplateFromCollaboration(
      entitiesId.challenge.collaborationId,
      entitiesId.space.templateSetId,
      'Subspace Template 2'
    );

    templateId = res?.data?.createTemplateFromCollaboration.id ?? '';


    // Act
    const resDeleteTemplate = await deleteTemplate(templateId);
    const countAfter = await getCollaborationTemplatesCountForSpace(
      entitiesId.spaceId
    );

    // Assert
    expect(countAfter).toEqual(countBefore);
    expect(resDeleteTemplate?.data?.deleteTemplate.id).toEqual(templateId);
  });

  test('Update subspace template', async () => {
    // Arrange
    const res = await createTemplateFromCollaboration(
      entitiesId.challenge.collaborationId,
      entitiesId.space.templateSetId,
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
