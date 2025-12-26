import { test, expect } from '@playwright/test';

test('Inventory System - Create Product and Sell via POS', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout to 60s for debugging

    // 1. Login as Admin
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'jabetancur12@gmail.com');
    await page.fill('input[type="password"]', '12345678');
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation...');
    await page.waitForTimeout(3000); // Wait for potential redirects/load

    // Check if we are on select location
    if (page.url().includes('select-location')) {
        console.log('On Select Location page, selecting first location...');
        await page.click('text=Sede Principal');
        await page.waitForURL('**/');
    }

    console.log('On Dashboard. URL:', page.url());

    // 3. Navigate to Inventory Page
    console.log('Clicking Inventario...');
    await page.waitForSelector('text=Inventario', { timeout: 10000 });
    await page.click('text=Inventario');

    // 4. Create New Product
    console.log('Waiting for Inventory Page...');
    await page.waitForSelector('h1:has-text("Inventario de Productos")');

    const uniqueId = Math.floor(Math.random() * 10000);
    const productName = `CocaCola Test ${uniqueId}`;

    console.log(`Creating product: ${productName}`);
    await page.click('[data-testid="btn-new-product"]');
    await page.waitForSelector('[data-testid="input-product-name"]'); // Wait for modal
    await page.fill('[data-testid="input-product-name"]', productName);
    await page.fill('[data-testid="input-product-price"]', '2500');
    await page.fill('[data-testid="input-product-stock"]', '10');
    await page.fill('[data-testid="input-product-min-stock"]', '5');
    await page.click('[data-testid="btn-save-product"]');

    // Verify it appears in list
    console.log('Verifying creation...');
    await expect(page.locator(`[data-testid="product-row-${productName}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="product-row-${productName}"]`)).toContainText('10'); // Stock 10
    console.log(`Product ${productName} created with 10 stock`);

    // 5. Navigate to Incomes Page (POS)
    console.log('Navigating to Incomes...');
    await page.click('text=Ingresos'); // Link in sidebar
    await page.waitForSelector('text=Ingresos & Ventas');

    // Ensure we are in POS mode
    const posButton = page.locator('button:has-text("Punto de Venta")');
    if (await posButton.isVisible()) {
        console.log('Switching to POS mode...');
        await posButton.click();
    }

    // 6. Sell 2 items
    console.log('Adding items to cart...');
    await page.waitForSelector(`[data-testid="product-pos-btn-${productName}"]`);
    await page.click(`[data-testid="product-pos-btn-${productName}"]`); // Add 1
    await page.click(`[data-testid="product-pos-btn-${productName}"]`); // Add 2nd

    // Verify Cart
    await expect(page.locator('text=Pedido Actual')).toBeVisible();
    await expect(page.locator(`text=${productName}`).first()).toBeVisible();
    await expect(page.locator('text=2 x $2,500')).toBeVisible();

    // Confirm Sale
    console.log('Confirming sale...');

    // Handle dialog
    page.once('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
    });

    await page.click('[data-testid="btn-confirm-pos-sale"]');

    // Wait for transaction to complete (simple wait or check for alert handling)
    await page.waitForTimeout(2000);

    // 7. Verify Stock Deduction in Inventory
    console.log('Checking stock deduction...');
    await page.click('text=Inventario');
    await page.waitForSelector('h1:has-text("Inventario de Productos")');

    // Check stock is now 8
    await expect(page.locator(`[data-testid="product-row-${productName}"]`)).toContainText('8');
    console.log('Stock deduction verified: 10 -> 8');
});
