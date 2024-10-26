import { deleteSpace } from '../../journey/space/space.request.params';
import { deleteOrganization } from '../../contributor-management/organization/organization.request.params';
import { entitiesId } from '../../../types/entities-helper';
import { uniqueId } from '@test/utils/mutations/create-mutation';
import { TestUser } from '@test/utils/token.helper';
import {
  createOrgAndSpaceWithUsers,
  createChallengeForOrgSpace,
} from '../../../utils/data-setup/entities';
import {
  createTemplateFromCollaboration,
  deleteCollaborationTemplate,
  getCollaborationTemplatesCount,
  updateCollaborationTemplate,
} from './collaboration-template.request.params';
import { getCollaborationTemplatesCountForSpace } from './collaboration-template.request.params';
import {
  emptyLifecycleDefaultDefinition,
  errorAuthCreateCollaboration,
  errorAuthDeleteCollaboration,
  errorAuthUpdateCollaboration,
  errorDeleteLastCollaborationTemplate,
  errorInvalidDescription,
  errorNoCollaboration,
  lifecycleDefaultDefinition,
  lifecycleDefinitionUpdate,
  templateInfoUpdate,
} from './collaboration-template-testdata';
import { GetTemplateById } from '../template.request.params';

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
    await deleteCollaborationTemplate(templateId);
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

    const res = await createTemplateFromCollaboration(
      entitiesId.challenge.collaborationId,
      entitiesId.space.templateSetId,
      'Subspace Template 2'
    );

    templateId = res?.data?.createTemplateFromCollaboration.id ?? '';
    const countBefore = await getCollaborationTemplatesCountForSpace(
      entitiesId.spaceId
    );

    // Act
    const resDeleteTemplate = await deleteCollaborationTemplate(templateId);

    const countAfter = await getCollaborationTemplatesCountForSpace(
      entitiesId.spaceId
    );

    // Assert
    expect(countAfter).toEqual(countBefore);
    expect(resDeleteTemplate?.data?.deleteTemplate.id).toEqual(templateId);
  });

  // test.only('Update subspace template', async () => {
  //   // Arrange
  //   const res = await createTemplateFromCollaboration(
  //     entitiesId.challenge.collaborationId,
  //     entitiesId.space.templateSetId,
  //     'Subspace Template 3'
  //   );
  //   const collaborationData = res?.data?.createTemplateFromCollaboration;
  //   templateId = collaborationData?.id ?? '';

  //   templateId = res?.data?.createTemplateFromCollaboration.id ?? '';

  //   // Act

  //   const updateTemplateData = await updateCollaborationTemplate()

  //   // Assert
  //   expect(countAfter).toEqual(countBefore);
  //   expect(resDeleteTemplate?.data?.deleteTemplate.id).toEqual(templateId);
  // });

  test.only('Update subspace template', async () => {
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

  // describe('Create collaboration template', () => {
  //   // Arrange
  //   test.each`
  //     profile                                          | states
  //     ${{ displayName: 'inno5' }}                      | ${lifecycleDefaultDefinition}
  //     ${{ displayName: 'inno6', description: 'desc' }} | ${lifecycleDefaultDefinition}
  //   `('should create inovation flow template', async ({ profile, states }) => {
  //     // Act
  //     const res = await createCollaborationTemplate(
  //       entitiesId.space.templateSetId,
  //       profile,
  //       states
  //     );
  //     const templateData = res?.data?.createTemplate;
  //     templateId = templateData?.id ?? '';
  //     expect(templateData?.id).toBeDefined();
  //     expect(templateData?.profile).toEqual(
  //       expect.objectContaining({
  //         displayName: profile.displayName,
  //         description: profile.description ?? null,
  //       })
  //     );
  //     expect(templateData?.collaboration?.innovationFlow.states).toEqual(
  //       states
  //     );
  //   });
  // });
});

// describe('Post templates - Negative Scenarios', () => {
//   afterEach(async () => {
//     await deleteCollaborationTemplate(templateId);
//   });
//   // I think it shouldn't fail
//   test.skip('Should fail creation of identical collaboration templates', async () => {
//     // Arrange
//     const countBefore = await getCollaborationTemplatesCountForSpace(
//       entitiesId.spaceId
//     );

//     // Act
//     const resTemplateOne = await createCollaborationTemplate(
//       entitiesId.space.templateSetId
//     );
//     const templateData = resTemplateOne?.data?.createTemplate;
//     templateId = templateData?.id ?? '';
//     const templateName = templateData?.profile?.displayName;

//     const resTemplateTwo = await createCollaborationTemplate(
//       entitiesId.space.templateSetId
//     );

//     const countAfter = await getCollaborationTemplatesCountForSpace(
//       entitiesId.spaceId
//     );

//     // Assert
//     expect(countAfter).toEqual((countBefore as number) + 1);
//     expect(resTemplateTwo.error?.errors[0].message).toEqual(
//       `Collaboration Template with the provided name already exists: ${templateName}`
//     );
//   });

//   describe('Should FAIL to create collaboration template', () => {
//     // Arrange
//     test.each`
//       definition                         | info                         | result                     | errorType
//       ${emptyLifecycleDefaultDefinition} | ${{ displayName: 'inno8a' }} | ${errorInvalidDescription} | ${'Invalid definition'}
//     `(
//       'should fail to create template with invalid: "$errorType"',
//       async ({ definition, info, result }) => {
//         // Act
//         const res = await createCollaborationTemplate(
//           entitiesId.space.templateSetId,
//           info,
//           definition
//         );

//         // Assert
//         expect(res.error?.errors[0].message).toContain(result);
//       }
//     );
//   });

//   test('Delete non existent Collaboration template', async () => {
//     // Act
//     const res = await deleteCollaborationTemplate(
//       '0bade07d-6736-4ee2-93c0-b2af22a998ff'
//     );

//     // Assert
//     expect(res.error?.errors[0]?.message).toContain(errorNoCollaboration);
//   });
// });

// describe('Collaboration templates - CRUD Authorization', () => {
//   describe('Collaboration templates - Create', () => {
//     describe('DDT user privileges to create space collaboration template - positive', () => {
//       // Arrange
//       afterEach(async () => {
//         await deleteCollaborationTemplate(templateId);
//       });
//       test.each`
//         userRole                 | message    | profile
//         ${TestUser.GLOBAL_ADMIN} | ${'inno8'} | ${{ displayName: 'inno8' }}
//         ${TestUser.HUB_ADMIN}    | ${'inno9'} | ${{ displayName: 'inno9' }}
//       `(
//         'User: "$userRole" creates successfully space collaboration template ',
//         async ({ userRole, message, profile }) => {
//           // Act
//           const resTemplateOne = await createCollaborationTemplate(
//             entitiesId.space.templateSetId,
//             profile,
//             lifecycleDefaultDefinition,
//             userRole
//           );

//           const templateData = resTemplateOne?.data?.createTemplate;
//           templateId = templateData?.id ?? '';

//           // Assert
//           expect(
//             resTemplateOne.data?.createTemplate.profile?.displayName
//           ).toEqual(message);
//         }
//       );
//     });

//     describe('DDT user privileges to create space collaboration template - negative', () => {
//       // Arrange
//       test.each`
//         userRole                   | message                         | profile
//         ${TestUser.HUB_MEMBER}     | ${errorAuthCreateCollaboration} | ${{ displayName: 'inno10' }}
//         ${TestUser.NON_HUB_MEMBER} | ${errorAuthCreateCollaboration} | ${{ displayName: 'inno11' }}
//       `(
//         'User: "$userRole" get error message: "$message", when intend to create space collaboration template ',
//         async ({ userRole, message, profile }) => {
//           // Act
//           const resTemplateOne = await createCollaborationTemplate(
//             entitiesId.space.templateSetId,
//             profile,
//             lifecycleDefaultDefinition,
//             userRole
//           );

//           // Assert
//           expect(resTemplateOne.error?.errors[0].message).toContain(message);
//         }
//       );
//     });
//   });

//   describe('Collaboration templates - Update', () => {
//     beforeAll(async () => {
//       const resCreateLifecycleTempl = await createCollaborationTemplate(
//         entitiesId.space.templateSetId,
//         { displayName: 'inno12' }
//       );
//       const templateData = resCreateLifecycleTempl?.data?.createTemplate;
//       templateId = templateData?.id ?? '';
//     });
//     afterAll(async () => {
//       await deleteCollaborationTemplate(templateId);
//     });

//     describe('DDT user privileges to update space collaboration template', () => {
//       // Arrange

//       test.each`
//         userRole                 | message
//         ${TestUser.GLOBAL_ADMIN} | ${templateInfoUpdate.displayName}
//         ${TestUser.HUB_ADMIN}    | ${templateInfoUpdate.displayName}
//       `(
//         'User: "$userRole" get message: "$message", when intend to update space collaboration template ',
//         async ({ userRole, message }) => {
//           // Act
//           const resUpdateTemplate = await updateCollaborationTemplate(
//             templateId,
//             templateInfoUpdate,
//             lifecycleDefaultDefinition,
//             userRole
//           );

//           // Assert
//           expect(
//             resUpdateTemplate.data?.updateTemplate.profile?.displayName
//           ).toContain(message);
//         }
//       );

//       test.each`
//         userRole                   | message
//         ${TestUser.HUB_MEMBER}     | ${errorAuthUpdateCollaboration}
//         ${TestUser.NON_HUB_MEMBER} | ${errorAuthUpdateCollaboration}
//       `(
//         'User: "$userRole" get ERROR message: "$message", when intend to update space collaboration template ',
//         async ({ userRole, message }) => {
//           // Act
//           const resUpdateTemplate = await updateCollaborationTemplate(
//             templateId,
//             templateInfoUpdate,
//             lifecycleDefaultDefinition,
//             userRole
//           );

//           // Assert
//           expect(resUpdateTemplate.error?.errors[0].message).toContain(message);
//         }
//       );
//     });
//   });

//   describe('Collaboration templates - Remove', () => {
//     describe('DDT user privileges to remove space collaboration template', () => {
//       // Arrange
//       afterEach(async () => {
//         await deleteCollaborationTemplate(templateId);
//       });
//       test.each`
//         userRole                 | profile
//         ${TestUser.GLOBAL_ADMIN} | ${{ displayName: 'inno13' }}
//         ${TestUser.HUB_ADMIN}    | ${{ displayName: 'inno14' }}
//       `(
//         'User: "$userRole" get message: "$message", when intend to remove space collaboration template ',
//         async ({ userRole, profile }) => {
//           // Act
//           const resCreateLifecycleTempl = await createCollaborationTemplate(
//             entitiesId.space.templateSetId,
//             profile
//           );
//           const templateData = resCreateLifecycleTempl?.data?.createTemplate;
//           templateId = templateData?.id ?? '';

//           const removeRes = await deleteCollaborationTemplate(
//             templateId,
//             userRole
//           );
//           // Assert
//           expect(removeRes.data?.deleteTemplate.id).toEqual(templateId);
//         }
//       );

//       test.each`
//         userRole                   | message                         | profile
//         ${TestUser.HUB_MEMBER}     | ${errorAuthDeleteCollaboration} | ${{ displayName: 'inno15' }}
//         ${TestUser.NON_HUB_MEMBER} | ${errorAuthDeleteCollaboration} | ${{ displayName: 'inno16' }}
//       `(
//         'User: "$userRole" get ERROR message: "$message", when intend to remove space collaboration template ',
//         async ({ userRole, message, profile }) => {
//           // Act
//           const resCreateLifecycleTempl = await createCollaborationTemplate(
//             entitiesId.space.templateSetId,
//             profile
//           );
//           const templateData = resCreateLifecycleTempl?.data?.createTemplate;
//           templateId = templateData?.id ?? '';

//           const removeRes = await deleteCollaborationTemplate(
//             templateId,
//             userRole
//           );

//           // Assert
//           expect(removeRes.error?.errors[0].message).toContain(message);
//         }
//       );
//     });
//   });
// });
