import { test, expect } from '@playwright/test';

const TARGET_URL = 'http://localhost:5173';
const USERNAME = 'oper.test';
const PASSWORD = 'oper123';
const LOCATION_NAME = 'La 38';

// Configuration
const RUN_DURATION_MS = 30 * 60 * 1000; // 1 Hour
const MIN_WAIT = 1 * 30 * 1000; // 1 Minute
const MAX_WAIT = 1 * 60 * 1000; // 3 Minutes
const BASE_AMOUNT = 200000;

function mostrarTiempo(r: number) {
    process.stdout.write(`\r⏱️ ${(r / 1000).toFixed(0)}s...`);
}


// Helper to generate random time
const randomWait = () => Math.floor(Math.random() * (MAX_WAIT - MIN_WAIT + 1)) + MIN_WAIT;

const randomPlate = () => {
    const letters = 'XYZ';
    const numbers = Math.floor(Math.random() * 900) + 100;
    const l1 = letters[Math.floor(Math.random() * 3)];
    const l2 = letters[Math.floor(Math.random() * 3)];
    const l3 = letters[Math.floor(Math.random() * 3)];
    return `${l1}${l2}${l3}-${numbers}`;
};

test.describe('Ghost User Simulation', () => {
    test('Simulate 1 Hour Operation with Finance', async ({ page }) => {
        test.setTimeout(RUN_DURATION_MS + 300000); // Allow test to run slightly longer than logic

        console.log('👻 Ghost User Starting...');
        console.log(`⏱️ Duration set to 1 Hour. Base Cash: $${BASE_AMOUNT}`);

        let currentCash = BASE_AMOUNT;
        const startTime = Date.now();

        // 1. Login
        console.log('🔑 Logging in...');
        await page.goto(`${TARGET_URL}/login`);
        await page.fill('input[placeholder="Enter username"]', USERNAME);
        await page.fill('input[placeholder="Enter password"]', PASSWORD);
        await page.click('button:has-text("Ingresar")');
        await page.waitForTimeout(2000);

        // 2. Select Location
        const locSelector = page.locator(`button:has-text("${LOCATION_NAME}")`);
        if (await locSelector.isVisible()) {
            console.log(`📍 Selecting ${LOCATION_NAME}...`);
            await locSelector.click();
            await page.waitForTimeout(1000);
        }

        // 3. Ensure Shift Open
        const openShiftBtn = page.locator('button:has-text("Abrir Turno")');
        if (await openShiftBtn.isVisible()) {
            console.log('⏰ Opening Shift...');
            const baseInput = page.locator('input[type="number"]');
            if (await baseInput.isEditable()) await baseInput.fill(BASE_AMOUNT.toString());
            await openShiftBtn.click();
            await page.waitForTimeout(2000);
        } else {
            console.log('✅ Shift Already Open. Assuming existing cash is handled.');
            // Note: In a real scenario we'd need to fetch current cash if already open, 
            // but for this ghost script we assume we start fresh or just tack on to 200k base logic.
        }

        console.log('🚀 Operations Loop Started...');

        while (Date.now() - startTime < RUN_DURATION_MS) {
            // Roll Action: 
            // 0-30: Entry
            // 30-60: Exit
            // 60-80: Monthly
            // 80-90: Income
            // 90-100: Expense
            const roll = Math.random() * 100;
            let action = '';

            if (roll < 30) action = 'ENTRY';
            else if (roll < 60) action = 'EXIT';
            else if (roll < 80) action = 'MONTHLY';
            else if (roll < 90) action = 'INCOME';
            else action = 'EXPENSE';

            console.log(`🎲 Action Rolled: ${action} | Cash: $${currentCash}`);

            try {
                if (action === 'ENTRY') {
                    if (!page.url().endsWith('/parking')) await page.goto(`${TARGET_URL}/parking`);

                    // New Entry Logic with Robust Selectors
                    const newEntryBtn = page.locator('button[data-testid="btn-open-entry-modal"]');
                    if (await newEntryBtn.isVisible()) {
                        await newEntryBtn.click();
                        await page.waitForTimeout(500);

                        // Use name/id selectors
                        const plateInput = page.locator('input[name="plate"]');
                        if (await plateInput.isVisible()) {
                            const plate = randomPlate();
                            await plateInput.fill(plate);

                            const type = Math.random() > 0.5 ? 'CAR' : 'MOTORCYCLE';
                            await page.click(`button[data-testid="btn-type-${type}"]`);

                            await page.click('button[data-testid="btn-register-entry"]');
                            console.log(`[ENTRY] 🚗 ${plate} (${type})`);

                            await page.waitForTimeout(1000);
                            const noPrintBtn = page.locator('button:has-text("No, gracias")');
                            if (await noPrintBtn.isVisible()) await noPrintBtn.click();
                        }
                    }

                } else if (action === 'EXIT') {
                    if (!page.url().endsWith('/parking')) await page.goto(`${TARGET_URL}/parking`);

                    // Use robust data-testid selector
                    // Wait for table release
                    await page.waitForTimeout(2000);
                    const exitButtons = await page.locator('button[data-testid="btn-request-exit"]').all();

                    if (exitButtons.length > 0) {
                        const btn = exitButtons[Math.floor(Math.random() * exitButtons.length)];
                        // Use force click to avoid scroll issues
                        await btn.click({ force: true });
                        await page.waitForTimeout(500);

                        // Confirm using data-testid
                        const confirmBtn = page.locator('button[data-testid="btn-confirm-exit"]');
                        if (await confirmBtn.isVisible()) {
                            // Estimate Cost (Simulated tracking, assume generic average for ghost logic)
                            const avgCost = 5000;
                            currentCash += avgCost;

                            await confirmBtn.click();
                            console.log(`[EXIT] 💰 Collected ~$${avgCost}. New Total: $${currentCash}`);

                            await page.waitForTimeout(1000);
                            const noPrintBtn = page.locator('button:has-text("No, gracias")');
                            if (await noPrintBtn.isVisible()) await noPrintBtn.click();
                        }
                    } else {
                        console.log('[EXIT] No cars to exit.');
                    }

                } else if (action === 'MONTHLY') {
                    await page.goto(`${TARGET_URL}/monthly-clients`);
                    const newClientBtn = page.locator('button[data-testid="btn-open-new-client"]');
                    if (await newClientBtn.isVisible()) {
                        await newClientBtn.click();
                        await page.waitForTimeout(1000);

                        // Inputs - Using explicit name/id selectors for 100% reliability
                        try {
                            // Wait for plate input directly, ignoring dialog role issues
                            const plateInput = page.locator('input[name="plate"]');
                            await plateInput.waitFor({ state: 'visible', timeout: 5000 });

                            await plateInput.fill(randomPlate());
                            await page.locator('input[name="name"]').fill('Ghost User Client');
                            await page.locator('input[name="phone"]').fill('3000000000');

                            // Create Button via data-testid or text
                            const createBtn = page.locator('button[data-testid="btn-create-client"]');
                            if (await createBtn.isVisible()) {
                                await createBtn.click();
                            } else {
                                await page.click('button:has-text("Crear Cliente")');
                            }
                            console.log(`[MONTHLY] 📅 Created New Monthly Client`);

                            // Handle Print Receipt Modal
                            const cancelPrintBtn = page.locator('button:has-text("Cancelar")').last();
                            if (await cancelPrintBtn.isVisible({ timeout: 3000 })) {
                                await cancelPrintBtn.click();
                            }
                        } catch (e) {
                            console.log('⚠️ Failed to fill monthly client form', e);
                        }
                    }

                } else if (action === 'INCOME') {
                    await page.goto(`${TARGET_URL}/incomes`);
                    await page.waitForTimeout(1000);

                    const descInput = page.locator('input[placeholder*="Descripción"], input[name="description"]');
                    const amountInput = page.locator('input[placeholder*="0.00"], input[name="amount"]');
                    const regBtn = page.locator('button:has-text("Registrar")');

                    if (await amountInput.isVisible()) {
                        const amount = 2000 + Math.floor(Math.random() * 5000);

                        // Use explicit name selectors
                        const descInput = page.locator('input[name="description"]');
                        const amountInputByName = page.locator('input[name="amount"]');

                        if (await descInput.isVisible()) {
                            await descInput.fill('Venta Varia Ghost');
                            await amountInputByName.fill(amount.toString());
                            await regBtn.click();

                            currentCash += amount;
                            console.log(`[INCOME] 💵 Registered +$${amount}. New Total: $${currentCash}`);
                        }
                    }

                } else if (action === 'EXPENSE') {
                    await page.goto(`${TARGET_URL}/expenses`);
                    await page.waitForTimeout(1000);

                    const descInput = page.locator('input[placeholder*="Descripción"], input[name="description"]');
                    const amountInput = page.locator('input[placeholder*="0.00"], input[name="amount"]');
                    const regBtn = page.locator('button:has-text("Registrar")');

                    if (await amountInput.isVisible()) {
                        const amount = 1000 + Math.floor(Math.random() * 2000);

                        // Use explicit name selectors
                        const descInput = page.locator('input[name="description"]');
                        const amountInputByName = page.locator('input[name="amount"]');

                        if (await descInput.isVisible()) {
                            await descInput.fill('Gasto Vario Ghost');
                            await amountInputByName.fill(amount.toString());
                            await regBtn.click();

                            currentCash -= amount;
                            console.log(`[EXPENSE] 💸 Registered -$${amount}. New Total: $${currentCash}`);
                        }
                    }
                }

            } catch (e) {
                console.error('⚠️ Action Error:', e);
                await page.goto(`${TARGET_URL}/`);
            }

            const waitTime = randomWait();
            console.log(`⏳ Starting wait: ${(waitTime / 1000).toFixed(0)}s`);

            // Real-time countdown
            for (let r = waitTime; r > 0; r -= 1000) {
                // Log only if it's a multiple of 5s or less than 10s to avoid too much spam, 
                // OR log every second if that's strictly what's requested. 
                // "real time" implies constant updates.
                // console.log(`⏱️ ${(r / 1000).toFixed(0)}s...`);
                mostrarTiempo(r);
                await page.waitForTimeout(1000);
            }
        }

        // FINAL CLOSE SHIFT
        console.log('🏁 1 Hour Reached. Closing Shift...');
        await page.goto(`${TARGET_URL}/`);
        await page.waitForTimeout(1000);

        const closeBtn = page.locator('button:has-text("Cerrar Turno")');
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(500);

            const cashInput = page.locator('input[placeholder="0"]');
            if (await cashInput.isVisible()) {
                console.log(`📝 Declaring Cash: $${currentCash}`);
                await cashInput.fill(currentCash.toString());
                await page.click('button:has-text("Confirmar Cierre")');
                console.log('✅ Shift Closed Successfully.');
            }
        } else {
            console.log('⚠️ Could not find Close Shift button.');
        }

        console.log('👻 Ghost User Finished.');
    });
});
