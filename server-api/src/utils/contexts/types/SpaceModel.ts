import { ProfileModel } from "./ProfileModel";

export type SpaceModel = {
  id: string;
  nameId: string;
  profile: ProfileModel;
  communityId: string;
  collaboration: {
    id: string;
    calloutPostCollectionId: string;
    calloutWhiteboardId: string;
    calloutPostId: string;
    calloutPostCommentsId: string;
  },
  roleSetId: string;
  contextId: string;
  updatesId: string;
  communicationId: string;
};