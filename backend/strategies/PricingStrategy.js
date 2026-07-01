/**
 * PricingStrategy - Abstract base class for the Strategy Pattern.
 *
 * Each concrete pricing strategy must implement the calculatePrice method.
 * This enforces a consistent interface across all pricing strategies and
 * demonstrates OOP principles: abstraction and polymorphism.
 */
class PricingStrategy {
    /**
     * Calculate the total price for a parking booking.
     * @param {Object} slot - The ParkingSlot document from MongoDB
     * @param {number} durationHours - Duration of the booking in hours
     * @returns {number} Total price in dollars (rounded to 2 decimal places)
     * @throws {Error} If not overridden by a concrete subclass
     */
    calculatePrice(slot, durationHours) {
        throw new Error(
            `calculatePrice() must be implemented by a concrete PricingStrategy subclass. ` +
            `"${this.constructor.name}" has not implemented it.`
        );
    }

    /**
     * Returns a human-readable label for this strategy.
     * @returns {string}
     */
    getStrategyName() {
        throw new Error(
            `getStrategyName() must be implemented by a concrete PricingStrategy subclass.`
        );
    }
}

module.exports = PricingStrategy;
