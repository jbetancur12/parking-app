export const calculateOfflineCost = (
    session: any,
    tariffs: any[],
    settings: any
) => {
    // Grace Period from settings or default to 5
    // Settings can be an object { grace_period: "5" } or array of objects.
    // In useParkingPage, settings is likely the object from cache/API.

    // Normalize settings
    let gracePeriod = 5;
    if (settings && settings.grace_period) {
        gracePeriod = Number(settings.grace_period);
    } else if (Array.isArray(settings)) {
        const gp = settings.find((s: any) => s.key === 'grace_period');
        if (gp) gracePeriod = Number(gp.value);
    }

    // 1. Determine active pricing model
    const anyTariff = tariffs.find(t => t.vehicleType === session.vehicleType);
    const pricingModel = anyTariff?.pricingModel || 'MINUTE'; // Default to MINUTE

    // 2. Select Tariff Config
    let tariffConfig: any;

    if (pricingModel === 'MINUTE') {
        tariffConfig = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType === 'MINUTE');
    } else {
        // Traditional & Blocks -> Use HOUR
        tariffConfig = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType === 'HOUR');
    }

    if (!tariffConfig) {
        tariffConfig = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType !== 'DAY');
    }

    const dayTariff = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType === 'DAY');

    const entryTime = new Date(session.entryTime);
    const exitTime = new Date(); // Offline exit is NOW
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;

    let cost = 0;

    if (!tariffConfig) {
        return { cost: 0, durationMinutes, exitTime: exitTime.toISOString() };
    }

    if (session.planType === 'DAY') {
        const dayRate = dayTariff ? Number(dayTariff.cost) : (Number(tariffConfig.dayMaxPrice) || 15000);
        const days = Math.ceil(durationMinutes / 1440);
        cost = days * dayRate;
    } else {
        if (pricingModel === 'MINUTE') {
            const pricePerMinute = Number(tariffConfig.basePrice || 0);
            cost = durationMinutes * pricePerMinute;
        } else if (pricingModel === 'BLOCKS') {
            const baseTimeMinutes = Number(tariffConfig.baseTimeMinutes) || 60;
            const extraFracTimeMinutes = Number(tariffConfig.extraFracTimeMinutes) || 30;

            if (durationMinutes <= baseTimeMinutes) {
                cost = Number(tariffConfig.basePrice);
            } else {
                const extraMinutes = durationMinutes - baseTimeMinutes;
                const extraBlocks = Math.ceil(extraMinutes / extraFracTimeMinutes);
                cost = Number(tariffConfig.basePrice) + (extraBlocks * Number(tariffConfig.extraFracPrice || 0));
            }
        } else if (pricingModel === 'TRADITIONAL') {
            const fullHours = Math.floor(durationMinutes / 60);
            const remainingMinutes = durationMinutes % 60;

            let hoursCharged = fullHours;

            if (fullHours === 0) {
                hoursCharged = 1;
            } else {
                if (remainingMinutes > gracePeriod) {
                    hoursCharged += 1;
                }
            }

            const pricePerHour = Number(tariffConfig.cost || 0);
            cost = hoursCharged * pricePerHour;
        }

        // Flat Rate Cap
        const dayMaxPrice = tariffConfig.dayMaxPrice ? Number(tariffConfig.dayMaxPrice) : 0;
        const dayMinHours = tariffConfig.dayMinHours ? Number(tariffConfig.dayMinHours) : 0;

        if (dayMaxPrice > 0) {
            if (durationHours >= dayMinHours) {
                if (cost > dayMaxPrice) {
                    cost = dayMaxPrice;
                }
            }
        }
    }

    cost = Math.max(0, cost);

    return {
        cost,
        durationMinutes,
        exitTime: exitTime.toISOString()
    };
};
