import { chromium } from 'playwright';
import * as readline from 'readline';

const TARGET_URL = 'http://localhost:5173';
const USERNAME = 'oper.test';
const PASSWORD = 'oper123';
const LOCATION_NAME = 'Sede Test';
const BASE_AMOUNT = 200000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

const randomPlate = () => {
    const letters = 'XYZ';
    const numbers = Math.floor(Math.random() * 900) + 100;
    const l1 = letters[Math.floor(Math.random() * 3)];
    const l2 = letters[Math.floor(Math.random() * 3)];
    const l3 = letters[Math.floor(Math.random() * 3)];
    return `${l1}${l2}${l3}-${numbers}`;
};

(async () => {
    console.log('👻 Ghost Commander Starting...');

    // Launch browser in headed mode so user can see
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    let currentCash = BASE_AMOUNT;

    try {
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
            console.log('✅ Shift Already Open.');
        }

        while (true) {
            console.log('\n🎮 Ghost Commander Menu:');
            console.log('1. Entry (Entrada)');
            console.log('2. Exit (Salida)');
            console.log('3. Monthly Client (Mensualidad)');
            console.log('4. Income (Ingreso Extra)');
            console.log('5. Expense (Gasto)');
            console.log('6. Exit Commander (Salir)');

            const answer = await askQuestion('👉 Select Action (1-6): ');

            try {
                if (answer === '1') { // ENTRY
                    console.log('🔄 Navigating to Parking Page...');
                    await page.goto(`${TARGET_URL}/parking`);

                    console.log('🔍 Looking for "Nueva Entrada" button...');
                    const newEntryBtn = page.locator('button[data-testid="btn-open-entry-modal"]');

                    if (await newEntryBtn.isVisible()) {
                        console.log('✅ Button found. Clicking...');
                        await newEntryBtn.click();
                        await page.waitForTimeout(500);

                        console.log('⏳ Waiting for "plate" input...');
                        const plateInput = page.locator('input[name="plate"]');
                        try {
                            await plateInput.waitFor({ state: 'visible', timeout: 5000 });
                            console.log('✅ Input visible. Filling form...');

                            const plate = randomPlate();
                            await plateInput.fill(plate);

                            const type = Math.random() > 0.5 ? 'CAR' : 'MOTORCYCLE';
                            await page.click(`button[data-testid="btn-type-${type}"]`);

                            await page.click('button[data-testid="btn-register-entry"]');
                            console.log(`[ENTRY] 🚗 ${plate} (${type})`);

                            await page.waitForTimeout(1000);
                            const noPrintBtn = page.locator('button:has-text("No, gracias")');
                            if (await noPrintBtn.isVisible()) await noPrintBtn.click();
                        } catch (e) {
                            console.error('❌ Timeout waiting for modal inputs. Is the modal open?');
                        }
                    } else {
                        console.error('❌ "Nueva Entrada" button NOT found on this page.');
                        console.log('Current URL:', page.url());
                    }

                } else if (answer === '2') { // EXIT
                    console.log('🔄 Navigating to Parking Page...');
                    await page.goto(`${TARGET_URL}/parking`);

                    console.log('⏳ Waiting for exit buttons to load...');
                    // Wait a bit for table to fetch
                    await page.waitForTimeout(2000);

                    const exitButtons = await page.locator('button[data-testid="btn-request-exit"]').all();
                    console.log(`ℹ️ Found ${exitButtons.length} exit buttons.`);

                    if (exitButtons.length > 0) {
                        const randomIndex = Math.floor(Math.random() * exitButtons.length);
                        const btn = exitButtons[randomIndex];
                        console.log(`✅ Selected button #${randomIndex + 1}. Clicking...`);

                        try {
                            await btn.click({ force: true });
                        } catch (e) {
                            console.error('⚠️ Click failed. Trying JS click...');
                            await btn.evaluate((b: any) => b.click());
                        }

                        await page.waitForTimeout(500);

                        console.log('⏳ Waiting for confirmation modal...');
                        const confirmBtn = page.locator('button[data-testid="btn-confirm-exit"]');
                        if (await confirmBtn.isVisible()) {
                            const avgCost = 5000;
                            currentCash += avgCost;
                            await confirmBtn.click();
                            console.log(`[EXIT] 💰 Collected ~$${avgCost}. New Total: $${currentCash}`);

                            await page.waitForTimeout(1000);
                            const noPrintBtn = page.locator('button:has-text("No, gracias")');
                            if (await noPrintBtn.isVisible()) await noPrintBtn.click();
                        } else {
                            console.error('❌ Confirm Exit Valid/Button NOT visible');
                        }
                    } else {
                        console.warn('⚠️ No "Salida" buttons found. Is the parking empty or table failing to load?');
                    }

                } else if (answer === '3') { // MONTHLY
                    console.log('🔄 Navigating to Monthly Clients...');
                    await page.goto(`${TARGET_URL}/monthly-clients`);

                    console.log('🔍 Looking for "Nuevo Cliente" button...');
                    const newClientBtn = page.locator('button:has-text("Nuevo Cliente")');

                    if (await newClientBtn.isVisible()) {
                        console.log('✅ Button found. Clicking...');
                        await newClientBtn.click();
                        await page.waitForTimeout(1000); // Wait for animation

                        console.log('⏳ Waiting for modal dialog...');
                        // Use a more generic wait for the input as the dialog role might be unstable or different
                        const plateInput = page.locator('input[name="plate"]');

                        try {
                            await plateInput.waitFor({ state: 'visible', timeout: 5000 });
                            console.log('✅ Input field found. Filling form...');

                            await plateInput.fill(randomPlate());
                            await page.locator('input[name="name"]').fill('Ghost User Client');
                            await page.locator('input[name="phone"]').fill('3000000000');

                            console.log('👆 Clicking Create button...');
                            const createBtn = page.locator('button[data-testid="btn-create-client"]');
                            if (await createBtn.isVisible()) {
                                await createBtn.click();
                            } else {
                                console.warn('⚠️ data-testid button not found, trying text...');
                                await page.click('button:has-text("Crear Cliente")');
                            }
                            console.log(`[MONTHLY] 📅 Created New Monthly Client`);

                            // Handle Print Receipt Modal
                            console.log('⏳ Waiting for Print Receipt modal...');
                            try {
                                const cancelPrintBtn = page.locator('button:has-text("Cancelar")').last();
                                await cancelPrintBtn.waitFor({ state: 'visible', timeout: 3000 });
                                console.log('🚫 Clicking Cancel on Print Receipt...');
                                await cancelPrintBtn.click();
                            } catch (err) {
                                console.log('ℹ️ Print modal didn\'t appear or was skipped.');
                            }

                        } catch (e) {
                            console.error('❌ Failed to find input fields in modal.');
                            console.error(e);
                        }
                    } else {
                        console.error('❌ "Nuevo Cliente" button not found.');
                    }

                } else if (answer === '4') { // INCOME
                    await page.goto(`${TARGET_URL}/incomes`);
                    await page.waitForTimeout(1000);

                    const amountInputByName = page.locator('input[name="amount"]');
                    if (await amountInputByName.isVisible()) {
                        const amount = 2000 + Math.floor(Math.random() * 5000);
                        const descInput = page.locator('input[name="description"]');

                        if (await descInput.isVisible()) {
                            await descInput.fill('Venta Varia Ghost');
                            await amountInputByName.fill(amount.toString());
                            await page.click('button:has-text("Registrar")');

                            currentCash += amount;
                            console.log(`[INCOME] 💵 Registered +$${amount}. New Total: $${currentCash}`);
                        }
                    }

                } else if (answer === '5') { // EXPENSE
                    await page.goto(`${TARGET_URL}/expenses`);
                    await page.waitForTimeout(1000);

                    const amountInputByName = page.locator('input[name="amount"]');
                    if (await amountInputByName.isVisible()) {
                        const amount = 1000 + Math.floor(Math.random() * 2000);
                        const descInput = page.locator('input[name="description"]');

                        if (await descInput.isVisible()) {
                            await descInput.fill('Gasto Vario Ghost');
                            await amountInputByName.fill(amount.toString());
                            await page.click('button:has-text("Registrar")');

                            currentCash -= amount;
                            console.log(`[EXPENSE] 💸 Registered -$${amount}. New Total: $${currentCash}`);
                        }
                    }

                } else if (answer === '6') {
                    console.log('👋 Exiting...');
                    break;
                }
            } catch (err) {
                console.error('⚠️ Action Failed:', err);
                await page.goto(`${TARGET_URL}/`);
            }
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await browser.close();
        rl.close();
    }
})();
