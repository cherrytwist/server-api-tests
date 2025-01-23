import { OrganizationModel } from "./OrganizationModel";
import { SpaceModel } from "./SpaceModel";
import { Logger } from 'winston';

export type OrganizationWithSpaceModel = {
  logger: Logger;
  name: string;
  organization: OrganizationModel;
  space: SpaceModel;
  subspace: SpaceModel;
  subsubspace: SpaceModel;
  scenarioSetupSucceeded: boolean;
};
