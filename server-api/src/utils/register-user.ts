import { testConfiguration } from '@src/config/test.configuration';
import { registerInKratosOrFail, verifyInKratosOrFail } from './kratos';
import { registerInAlkemioOrFail } from './register-in-alkemio-or-fail';

const email = testConfiguration.identities.user.email;
const firstName = testConfiguration.identities.user.firstName;
const lastName = testConfiguration.identities.user.lastName;

const main = async () => {
  await registerInKratosOrFail(firstName, lastName, email);
  await verifyInKratosOrFail(email);
  await registerInAlkemioOrFail(firstName, lastName, email);
};

main().catch(error => {
  console.error(`Unable to register: ${error}`);
});
