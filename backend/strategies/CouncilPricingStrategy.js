const PricingStrategy = require('./PricingStrategy');

/**
 * CouncilPricingStrategy - Concrete strategy for suburban/council-partner parking slots.
 *
 * Applies a 10% council discount on top of the base hourly rate.
 * Used for slots with the "SUB-" prefix (Milton, South Brisbane, Red Hill, West End).
 *
 * Extends PricingStrategy to demonstrate inheritance and polymorphism.
 */
class CouncilPricingStrategy extends PricingStrategy {
    /**
     * Discount rate applied to council-partner slots (10% off base rate).
     */
    static COUNCIL_DISCOUNT_RATE = 0.10;

    /**
     * Calculate total cost at the discounted council-partner rate.
     * @param {Object} slot - ParkingSlot document with pricePerHour field
     * @param {number} durationHours - Booking duration in hours
     * @returns {number} Total price after council discount applied
     */
    calculatePrice(slot, durationHours) {
        const baseTotal = slot.pricePerHour * durationHours;
        const discountAmount = baseTotal * CouncilPricingStrategy.COUNCIL_DISCOUNT_RATE;
        const total = baseTotal - discountAmount;
        return Math.round(total * 100) / 100;
    }

    getStrategyName() {
        return `Council Partner Rate (${CouncilPricingStrategy.COUNCIL_DISCOUNT_RATE * 100}% discount)`;
    }
}

module.exports = CouncilPricingStrategy;
