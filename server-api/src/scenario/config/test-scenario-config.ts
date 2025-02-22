import {
  CommunityMembershipPolicy,
  SpacePrivacyMode,
} from '@alkemio/client-lib';
import { TestUser } from '@alkemio/tests-lib';

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
    members?: TestUser[];
    admins?: TestUser[];
    leads?: TestUser[];
  };
  collaboration?: {
    addTutorialCallouts?: boolean; // Only applicable on L0
    addPostCallout?: boolean;
    addPostCollectionCallout?: boolean;
    addWhiteboardCallout?: boolean;
  };
  subspace?: TestScenarioSpaceConfig;
  settings?: {
    privacy?: {
      mode?: SpacePrivacyMode;
    };
    membership?: {
      policy?: CommunityMembershipPolicy;
    };
  };
}

export interface TestScenarioOrganizationConfig {
  community?: {
    addMembers: boolean;
    addAdmin: boolean;
  };
}
