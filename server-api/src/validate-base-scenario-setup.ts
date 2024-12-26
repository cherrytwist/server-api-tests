// This is critical to be able to use TypeScript aliases in Jest tests
require('tsconfig-paths/register');
import * as dotenv from 'dotenv';
import { TestScenarioFactory } from './models/TestScenarioFactory';
import { TestScenarioConfig } from './models/test-scenario-config';

const scenarioConfig: TestScenarioConfig = {
  name: 'organization-settings',
  space: {
  },
};

const main = async () => {
  dotenv.config();
  const baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);
  console.log(`Base scenario: ${JSON.stringify(baseScenario)}`);
};

try {
  main();
} catch (error) {
  console.error(error);
}
