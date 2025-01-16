import { testConfiguration } from '@src/config/test.configuration';
import { registerInAlkemioOrFail } from '../scenario/registration/register-in-alkemio-or-fail';
import { registerInKratosOrFail } from '@src/scenario/registration/register-in-kratos-or-fail';
import { verifyInKratosOrFail } from '@src/scenario/registration/verify-in-kratos-or-fail';

const email = testConfiguration.identities.admin.email;
const firstName = testConfiguration.identities.admin.user.firstName;
const lastName = testConfiguration.identities.user.lastName;

const main = async () => {
  await registerInKratosOrFail(firstName, lastName, email);
  await verifyInKratosOrFail(email);
  await registerInAlkemioOrFail(firstName, lastName, email);
};

main().catch(error => {
  console.error(`Unable to register: ${error}`);
});
