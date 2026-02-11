import { Selector, t } from 'testcafe';

// --- Helpers ---
const signIn = async () => {
    await t.navigateTo('http://localhost:3000/auth/signin');

    await t
        .typeText('input[name="email"]', 'admin@foo.com', { replace: true })
        .typeText('input[name="password"]', 'changeme', { replace: true })
        .click('button[type="submit"]');

    // Wait for the list page or a logged-in state
    await t.expect(Selector('main').exists).ok('Expected main content to appear after sign-in');
};

// --- Tests ---
fixture('View Pantry & Edit Flow')
    .page('http://localhost:3000');

test('View Pantry page loads', async t => {
    await signIn();
    await t.navigateTo('http://localhost:3000/view-pantry');

    const viewPantryContainer = Selector('#view-pantry');
    await t.expect(viewPantryContainer.exists).ok('Expected view pantry container to exist');
});

test('Click edit link works', async t => {
    await signIn();
    await t.navigateTo('http://localhost:3000/view-pantry');

    const firstEditLink = Selector('tbody tr').nth(0).find('button.btn-edit');
    await t.expect(firstEditLink.exists).ok('Expected first edit link to exist');
    await t.click(firstEditLink);

    // Confirm we are on edit page
    const editForm = Selector('.modal.show');
    await t.expect(editForm.exists).ok('Expected edit form to exist');
});

/*
test('Edit form can modify item', async t => {
    await signIn();
    await t.navigateTo('http://localhost:3000/view-pantry');

    const firstEditLink = Selector('tbody tr').nth(0).find('button.btn-edit');
    await t.click(firstEditLink);

    const editForm = Selector('.modal.show');
    const nameInput = editForm.find('input[name="name"]');

    const originalName = await nameInput.value;
    const newName = originalName + ' Updated';

    await t
        .selectText(nameInput)
        .pressKey('delete')
        .typeText(nameInput, newName)
        .click(editForm.find('button[type="submit"]'));

    // Wait for modal to close
    await t.expect(editForm.exists).notOk('Expected edit form to be closed after submission');

    // Verify input reflects updated value after submission
    await t.expect(Selector('tbody tr').nth(0).find('td').nth(0).innerText).eql(newName, 'Expected name to be updated in the pantry list');

    // Cleanup: revert name change
    await t.click(Selector('tbody tr').nth(0).find('button.btn-edit'));
    await t
        .selectText(nameInput)
        .pressKey('delete')
        .typeText(nameInput, originalName)
        .click(editForm.find('button[type="submit"]'));

    await t.expect(editForm.exists).notOk('Expected edit form to be closed after reverting name change');
    await t.expect(Selector('tbody tr').nth(0).find('td').nth(0).innerText).eql(originalName, 'Expected name to be reverted in the pantry list');
});
*/