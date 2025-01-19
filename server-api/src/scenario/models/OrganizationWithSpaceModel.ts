import { OrganizationModel } from "./OrganizationModel";
import { SpaceModel } from "./SpaceModel";

export type OrganizationWithSpaceModel = {
  organization: OrganizationModel;
  space: SpaceModel;
  subspace: SpaceModel;
  subsubspace: SpaceModel;
  scenarioSetupSucceeded: boolean;
};
