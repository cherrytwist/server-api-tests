import { getMails } from '@utils/mailslurper.rest.requests';

/**
 * Returns 2 values:
 ** 1st: emails array
 ** 2nd: emails count
 */
export const getMailsData = async () => {
  const response = await getMails();
  const emailsData = response.body.mailItems;
  const emailsCount = response.body.totalRecords;

  return [emailsData, emailsCount];
};

interface CommonSpaceIds {
  profileId: string;
  communityId: string;
  roleSetId: string;
  updatesId: string;
  communicationId: string;
  contextId: string;
  collaborationId: string;
  calloutId: string;
  whiteboardCalloutId: string;
  discussionCalloutId: string;
  discussionCalloutCommentsId: string;
}

interface ProfileableIds {
  id: string;
  nameId: string;
  profileId: string;
}
interface EntityIds {
  accountId: string;
  whiteboardTemplateId: string;
  messageId: string;
  discussionId: string;
  organization: ProfileableIds & {
    accountId: string;
    agentId: string;
    verificationId: string;
    displayName: string;
  };
  space: CommonSpaceIds & {
    id: string;
    applicationId: string;
    templateId: string;
    templateSetId: string;
    subspaceCollaborationTemplateId: string;
  };
  subspace: CommonSpaceIds & ProfileableIds;
  subsubspace: CommonSpaceIds & ProfileableIds;
}

export const baseScenario: EntityIds = {
  accountId: '',
  whiteboardTemplateId: '',
  messageId: '',
  discussionId: '',
  organization: {
    id: '',
    accountId: '',
    nameId: '',
    profileId: '',
    agentId: '',
    verificationId: '',
    displayName: '',
  },
  space: {
    id: '',
    applicationId: '',
    profileId: '',
    communityId: '',
    roleSetId: '',
    updatesId: '',
    communicationId: '',
    contextId: '',
    collaborationId: '',
    calloutId: '',
    whiteboardCalloutId: '',
    discussionCalloutId: '',
    discussionCalloutCommentsId: '',
    templateId: '',
    templateSetId: '',
    subspaceCollaborationTemplateId: '',
  },
  subspace: {
    id: '',
    nameId: '',
    profileId: '',
    communityId: '',
    roleSetId: '',
    updatesId: '',
    communicationId: '',
    contextId: '',
    collaborationId: '',
    calloutId: '',
    whiteboardCalloutId: '',
    discussionCalloutId: '',
    discussionCalloutCommentsId: '',
  },
  subsubspace: {
    id: '',
    nameId: '',
    profileId: '',
    communityId: '',
    roleSetId: '',
    updatesId: '',
    communicationId: '',
    contextId: '',
    collaborationId: '',
    calloutId: '',
    whiteboardCalloutId: '',
    discussionCalloutId: '',
    discussionCalloutCommentsId: '',
  },
};
