
import { calculateParkingCost } from '../controllers/parking.controller';
import { ParkingSession, PlanType } from '../entities/ParkingSession';
import { Tariff, TariffType, PricingModel } from '../entities/Tariff';

// Mocks
const mockSession = {
    vehicleType: 'CAR',
    planType: 'HOUR',
    entryTime: new Date(),
} as ParkingSession;

// Helper to create tariffs
const createTariff = (type: 'MINUTE' | 'HOUR' | 'DAY', model: 'MINUTE' | 'BLOCKS' | 'TRADITIONAL', basePrice: number, cost: number, dayMaxPrice: number, dayMinHours: number): Tariff => {
    return {
        vehicleType: 'CAR',
        tariffType: type,
        pricingModel: model,
        basePrice,
        cost,
        dayMaxPrice,
        dayMinHours,
        extraFracPrice: 0,
        baseTimeMinutes: 60,
        extraFracTimeMinutes: 30
    } as any as Tariff;
}

// TEST CASES

console.log('--- TEST 1: TRADITIONAL Model (Hourly + Flat Rate Cap) ---');
// Scenario: 5 hours stay. Hourly cost $2000. Flat rate cap $8000. Min hours 4.
// Expected: 5 * 2000 = 10000. Capped at 8000.
{
    const tariffs = [
        createTariff('HOUR', 'TRADITIONAL', 0, 2000, 8000, 4) // HOUR tariff holds config for TRADITIONAL
    ];
    // Entry 5 hours ago
    const session = { ...mockSession, entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000) };

    const result = calculateParkingCost(session, tariffs, 15);
    console.log(`Duration: ${result.durationMinutes} mins. Hours: ${result.durationMinutes / 60}`);
    console.log(`Calculated Cost: ${result.cost}. Expected: 8000.`);
    if (result.cost === 8000) console.log('PASS'); else console.log('FAIL');
}


console.log('\n--- TEST 2: MINUTE Model (Per Minute + Flat Rate Cap) ---');
// Scenario: 300 minutes (5 hours). Minute price $50. Flat rate $12000. Min hours 6.
// Expected: 300 * 50 = 15000. Min hours 6 not met (5 < 6). So NO CAP. Cost 15000.
{
    const tariffs = [
        createTariff('MINUTE', 'MINUTE', 50, 0, 12000, 6), // MINUTE tariff holds config for MINUTE
        createTariff('HOUR', 'MINUTE', 0, 0, 0, 0) // Should be ignored
    ];
    const session = { ...mockSession, entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000) };

    const result = calculateParkingCost(session, tariffs, 15);
    console.log(`Duration: ${result.durationMinutes} mins.`);
    console.log(`Calculated Cost: ${result.cost}. Expected: 15000.`);
    if (result.cost === 15000) console.log('PASS'); else console.log('FAIL');
}

console.log('\n--- TEST 3: MINUTE Model (Per Minute + Flat Rate Cap APPLIED) ---');
// Scenario: 420 minutes (7 hours). Minute price $50. Flat rate $12000. Min hours 6.
// Expected: 420 * 50 = 21000. Min hours 6 MET (7 >= 6). Cap applied. Cost 12000.
{
    const tariffs = [
        createTariff('MINUTE', 'MINUTE', 50, 0, 12000, 6)
    ];
    const session = { ...mockSession, entryTime: new Date(Date.now() - 7 * 60 * 60 * 1000) };

    const result = calculateParkingCost(session, tariffs, 15);
    console.log(`Duration: ${result.durationMinutes} mins.`);
    console.log(`Calculated Cost: ${result.cost}. Expected: 12000.`);
    if (result.cost === 12000) console.log('PASS'); else console.log('FAIL');
}

console.log('\n--- TEST 4: BLOCKS Model (Base + Extra + Flat Rate Cap) ---');
// Scenario: 90 mins (1.5 hours). Base (60m) $3000. Extra (30m) $1000. No flat rate.
// Expected: 3000 + 1000 = 4000.
{
    const tariffs = [
        createTariff('HOUR', 'BLOCKS', 3000, 0, 0, 0) // BLOCKS uses HOUR tariff basePrice
    ];
    // Set extra frac price manually as helper doesn't set it perfectly
    tariffs[0].extraFracPrice = 1000;

    const session = { ...mockSession, entryTime: new Date(Date.now() - 90 * 60 * 1000) };

    const result = calculateParkingCost(session, tariffs, 15);
    console.log(`Duration: ${result.durationMinutes} mins.`);
    console.log(`Calculated Cost: ${result.cost}. Expected: 4000.`);
    if (result.cost === 4000) console.log('PASS'); else console.log('FAIL');
}
