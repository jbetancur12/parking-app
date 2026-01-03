import { EntityManager, LockMode } from '@mikro-orm/core';
import { Location } from '../entities/Location';

export class ReceiptService {
    /**
     * Generates a sequential receipt number for a given location.
     * MUST be called within an existing transaction or wraps itself in one if needed (though locking requires active tx).
     * @param em The EntityManager (should be transactional if locking)
     * @param locationId The ID of the location
     * @returns The new receipt number as a string
     */
    static async getNextReceiptNumber(em: EntityManager, locationId: string): Promise<string> {
        // Use PESSIMISTIC_WRITE lock to ensure no duplicates during high concurrency
        const location = await em.findOneOrFail(Location, { id: locationId }, { lockMode: LockMode.PESSIMISTIC_WRITE });

        location.currentReceiptNumber = (location.currentReceiptNumber || 0) + 1;

        // Ensure changes are persisted implicitly by the transaction commit that calls this

        return location.currentReceiptNumber.toString();
    }
}
