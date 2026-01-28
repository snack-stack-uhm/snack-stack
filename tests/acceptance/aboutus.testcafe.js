import { Selector, t } from 'testcafe';

fixture('About Us Page')
    .page('http://localhost:3000/aboutus');

test('About Us page loads', async t => {
    // Check for main heading
    const mainHeading = Selector('h1').withText('About Snack Stack');
    await t.expect(mainHeading.exists).ok('Expected main heading "About Snack Stack"');

    // Check for a secondary heading
    const subHeading = Selector('h2').withText('Why We Built It');
    await t.expect(subHeading.exists).ok('Expected subheading "Why We Built It"');

    // Optional: check for logo image
    const logo = Selector('img').withAttribute('alt', 'Snack Stack Logo');
    await t.expect(logo.exists).ok('Expected logo image to be present');
});
