const PricingStrategy = require('./PricingStrategy');

/**
 * StandardPricingStrategy - Concrete strategy for QUT campus parking slots.
 *
 * Applies the base price per hour with no discounts.
 * Used for slots at QUT Gardens Point (GP-*) and QUT Kelvin Grove (KG-*).
 *
 * Extends PricingStrategy to demonstrate inheritance and polymorphism.
 */
class StandardPricingStrategy extends PricingStrategy {
    /**
     * Calculate total cost at the standard rate.
     * @param {Object} slot - ParkingSlot document with pricePerHour field
     * @param {number} durationHours - Booking duration in hours
     * @returns {number} Total price (pricePerHour × durationHours)
     */
    calculatePrice(slot, durationHours) {
        const total = slot.pricePerHour * durationHours;
        return Math.round(total * 100) / 100;
    }

    getStrategyName() {
        return 'Standard (QUT Campus Rate)';
    }
}

module.exports = StandardPricingStrategy;
