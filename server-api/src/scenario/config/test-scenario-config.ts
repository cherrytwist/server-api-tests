export interface TestScenarioConfig {
  name: string;
  organization?: TestScenarioOrganizationConfig;
  space?: TestScenarioSpaceConfig;
}

export interface TestScenarioWithOrganizationConfig {
  name: string;
  organization?: TestScenarioOrganizationConfig;
}

export interface TestScenarioNoPreCreationConfig {
  name: string;
}

export interface TestScenarioSpaceConfig {
  community?: {
    addMembers: boolean;
    addAdmin: boolean;
  };
  collaboration?: {
    addPostCallout?: boolean;
    addPostCollectionCallout?: boolean;
    addWhiteboardCallout?: boolean;
  };
  subspace?: TestScenarioSpaceConfig;
}

export interface TestScenarioOrganizationConfig {
  community?: {
    addMembers: boolean;
    addAdmin: boolean;
  };
}
