/*

import { Selector, t } from 'testcafe';
import SignUpPage from './pages/SignUpPage';

fixture('SignUp Page')
  .page('http://localhost:3000/auth/signup');

test('Page loads', async t => {
  await SignUpPage.isDisplayed();
});

test('Can fill out sign up form', async t => {
  const testEmail = `user${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  await SignUpPage.signup(testEmail, testPassword);

  // Wait for the verification popup to appear (wait up to 6 seconds)
  const verificationPopup = Selector('div').withText(/verify your email/i);

  await t
    .expect(verificationPopup.exists)
    .ok('Expected verification popup to appear after signup', { timeout: 6000 });
});

*/