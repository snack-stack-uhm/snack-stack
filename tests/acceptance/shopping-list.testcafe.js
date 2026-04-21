import { Selector, t } from 'testcafe';

const adminEmail = 'admin@foo.com';
const password = 'changeme';
const baseUrl = 'http://localhost:3000';

// ----------
// HELPERS
// ----------
const signIn = async (email, password) => {
    await t.navigateTo(`${baseUrl}/auth/signin`);
    await t
        .typeText('input[name="email"]', email, { replace: true })
        .typeText('input[name="password"]', password, { replace: true })
        .click('button[type="submit"]');

    // Wait for login success
    await t.expect(Selector('main').exists).ok({ timeout: 8000 });
};

const signOut = async () => {
    await t.navigateTo(`${baseUrl}/auth/signout`);
    const signOutHeading = Selector('h1').withText(/sign out/i);
    await t.expect(signOutHeading.exists).ok({ timeout: 5000 });
};


// ----------
// FIXTURE
// ----------
fixture('Shopping List Page Acceptance Tests')
    .page(baseUrl);

// ----------
// TEST CASE
// ----------
test('Shopping List page loads and all key UI elements work', async t => {
    await signIn(adminEmail, password);
    await t.navigateTo(`${baseUrl}/shopping-list`);

    // Verify main container
    const mainContainer = Selector('#view-shopping-list');
    await t.expect(mainContainer.exists).ok('Main container not found');

    // Verify title text
    const title = Selector('h1').withText('Your Shopping Lists');
    await t.expect(title.exists).ok('Title missing');

    await signOut();
});

/*
test('Search filters shopping lists correctly', async t => {
    const searchInput = Selector('input[placeholder="Search shopping lists..."]');
    const listCards = Selector('.card');
    const noResultsText = Selector('p.text-muted').withText('No shopping lists found');

    await signIn(adminEmail, password);
    await t.navigateTo(`${baseUrl}/shopping-list`);

    // Ensure lists render
    await t.expect(listCards.count).gt(0, 'Initial lists should be visible');

    // Grab the name of the first list card so we can search for it dynamically
    const firstListText = await listCards.nth(0).innerText;

    // Search using the first list title
    await t.typeText(searchInput, firstListText.trim(), { replace: true });

    // Search for something that shouldn't exist
    await t.typeText(searchInput, 'xyz-nothing-should-match', { replace: true });

    await t.expect(noResultsText.exists).ok('No results message should appear');
    await t.expect(listCards.count).eql(0, 'No cards should be shown');

    // Clear search → lists return
    await t.selectText(searchInput).pressKey('delete');
    await t.expect(listCards.count).gt(0, 'Lists should reappear after clearing search');

    await signOut();
});
*/

/*
test('User can open and view a shopping list, see its items, and close the modal', async t => {
    // Selectors
    const firstCard = Selector('.card').nth(0);
    const viewButton = firstCard.find('button').withText('View');
    const modal = Selector('.modal.show');
    const modalTitle = modal.find('.modal-title')
    const itemTable = modal.find('table');
    const closeButton = modal.find('button').withText('CLOSE');
    const noItemsMessage = modal.find('p.text-muted').withText('No items in this shopping list.');

    await signIn(adminEmail, password);
    await t.navigateTo(`${baseUrl}/shopping-list`);

    // Ensure page renders a list card
    await t.expect(firstCard.exists).ok('A shopping list card should be visible');

    // Click "View" to open the modal
    await t.click(viewButton);

    // Check that the modal opens
    await t.expect(modalTitle.exists).ok('Modal title should appear');
    await t.expect(modal.visible).ok('Modal should be visible');
    await t.expect(itemTable.exists).ok('Item table should be present in modal');
    await t.expect(closeButton.exists).ok('Close button should be present in modal');

    // If the list has items, verify table headers exist
    const hasItems = await itemTable.exists;
    if (hasItems) {
        await t
        .expect(itemTable.find('th').withText('Item').exists).ok()
        .expect(itemTable.find('th').withText('Quantity').exists).ok()
        .expect(itemTable.find('th').withText('Price').exists).ok();
    } else {
        // Otherwise, check that the "No items" message shows
        await t.expect(noItemsMessage.exists).ok('Should show empty list message');
    }

    // Click close button
    await t.click(closeButton);

    // Modal should close
    await t.expect(modal.exists).notOk('Modal should close after clicking Close');

    await signOut();
});
*/

test('Delete modal opens and cancels correctly from shopping list card', async t => {
    // Selectors
    const firstCard = Selector('.card').nth(0);
    const deleteButton = firstCard.find('button.btn.btn-danger');
    const modal = Selector('.modal.show').withText('Delete');
    const modalTitle = modal.find('.modal-title').withText(/^Delete /);
    const cancelButton = modal.find('button').withText('CANCEL');

    await signIn(adminEmail, password);
    await t.navigateTo(`${baseUrl}/shopping-list`);

    // Ensure page renders a list card
    await t.expect(firstCard.exists).ok('A shopping list card should be visible');

    // Click "Delete" to open the modal
    await t.click(deleteButton);

    // Check that the modal opens
    await t.expect(modalTitle.exists).ok('Modal title should appear');
    await t.expect(modal.visible).ok('Modal should be visible');
    await t.expect(cancelButton.exists).ok('Cancel button should be present in modal');

    // Click cancel button
    await t.click(cancelButton);

    // Modal should close
    await t.expect(modal.exists).notOk('Modal should close after clicking Cancel');

    await signOut();
});
