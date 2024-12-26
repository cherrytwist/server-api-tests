// This is critical to be able to use TypeScript aliases in Jest tests
require('tsconfig-paths/register');
import { TestScenarioFactory } from './scenario/TestScenarioFactory';
import { TestScenarioConfig } from './scenario/config/test-scenario-config';
import { testConfiguration } from './config/test.configuration';

const scenarioConfig: TestScenarioConfig = {
  name: 'organization-settings',
  space: {
  },
};

const main = async () => {
  const testConfig = testConfiguration;
  console.log(`Test config: ${JSON.stringify(testConfig, null, 2)}`);

  const baseScenario =
    await TestScenarioFactory.createBaseScenario(scenarioConfig);
  console.log(`Base scenario: ${JSON.stringify(baseScenario, null, 2)}`);
};

try {
  main();
} catch (error) {
  console.error(error);
}
