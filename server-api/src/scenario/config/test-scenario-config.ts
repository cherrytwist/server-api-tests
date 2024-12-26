export interface TestScenarioConfig {
  name: string;
  organization?: {}; // Just a placeholder for now, not used
  space?: TestScenarioSpaceConfig;
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


