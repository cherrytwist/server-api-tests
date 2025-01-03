export interface TestScenarioConfig {
  name: string;
  organization?: {}; // Just a placeholder for now, not used
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
    addCallouts: boolean;
  };
  subspace?: TestScenarioSpaceConfig;
}

export interface TestScenarioOrganizationConfig {
  community?: {
    addMembers: boolean;
    addAdmin: boolean;
  };
}
