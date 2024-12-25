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
  profile: {
    id: string;
    displayName: string;
  };
  community: {
    id: string;
    roleSetId: string;
  };
  communication: {
    id: string;
    updatesId: string;
  };
  contextId: string;
  collaboration: {
    id: string;
    calloutId: string;
    whiteboardCalloutId: string;
    discussionCalloutId: string;
    discussionCalloutCommentsId: string;
  };
}

interface ProfileableIds {
  id: string;
  nameId: string;
  profile: {
    id: string;
    displayName: string;
  };
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
    profile: {
      id: '',
      displayName: '',
    },
    agentId: '',
    verificationId: '',
  },
  space: {
    id: '',
    applicationId: '',
    profile: {
      id: '',
      displayName: '',
    },
    community: {
      id: '',
      roleSetId: '',
    },
    communication: {
      id: '',
      updatesId: '',
    },
    contextId: '',
    collaboration: {
      id: '',
      calloutId: '',
      whiteboardCalloutId: '',
      discussionCalloutId: '',
      discussionCalloutCommentsId: '',
    },
    templateId: '',
    templateSetId: '',
    subspaceCollaborationTemplateId: '',
  },
  subspace: {
    id: '',
    nameId: '',
    profile: {
      id: '',
      displayName: '',
    },
    community: {
      id: '',
      roleSetId: '',
    },
    communication: {
      id: '',
      updatesId: '',
    },
    contextId: '',
    collaboration: {
      id: '',
      calloutId: '',
      whiteboardCalloutId: '',
      discussionCalloutId: '',
      discussionCalloutCommentsId: '',
    },
  },
  subsubspace: {
    id: '',
    nameId: '',
    profile: {
      id: '',
      displayName: '',
    },
    community: {
      id: '',
      roleSetId: '',
    },
    communication: {
      id: '',
      updatesId: '',
    },
    contextId: '',
    collaboration: {
      id: '',
      calloutId: '',
      whiteboardCalloutId: '',
      discussionCalloutId: '',
      discussionCalloutCommentsId: '',
    },
  },
};
