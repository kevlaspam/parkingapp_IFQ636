const StandardPricingStrategy = require('./StandardPricingStrategy');
const CouncilPricingStrategy = require('./CouncilPricingStrategy');

/**
 * PricingContext - Context class for the Strategy Pattern.
 *
 * Holds a reference to a PricingStrategy and delegates price calculation to it.
 * Automatically selects the appropriate strategy based on the parking slot's
 * slot number prefix:
 *   - "SUB-" prefix → CouncilPricingStrategy (10% council discount)
 *   - All others    → StandardPricingStrategy (standard QUT campus rate)
 *
 * This demonstrates the Strategy Pattern: the algorithm (pricing) is
 * encapsulated in interchangeable strategy objects, decoupling it from the
 * context (the booking workflow).
 */
class PricingContext {
    /**
     * Slot number prefix that identifies council-partner parking slots.
     */
    static COUNCIL_PREFIX = 'SUB-';

    /**
     * @param {Object} slot - ParkingSlot document; used to auto-select strategy
     */
    constructor(slot) {
        this.slot = slot;
        this.strategy = this._selectStrategy(slot);
    }

    /**
     * Auto-select the pricing strategy based on the slot number prefix.
     * @param {Object} slot
     * @returns {PricingStrategy} The selected strategy instance
     */
    _selectStrategy(slot) {
        if (slot.slotNumber && slot.slotNumber.startsWith(PricingContext.COUNCIL_PREFIX)) {
            return new CouncilPricingStrategy();
        }
        return new StandardPricingStrategy();
    }

    /**
     * Allow callers to override the strategy (e.g. for testing or future admin overrides).
     * @param {PricingStrategy} strategy
     */
    setStrategy(strategy) {
        this.strategy = strategy;
    }

    /**
     * Calculate the total price for a booking duration.
     * @param {number} durationHours - Booking length in hours
     * @returns {{ totalCost: number, strategyUsed: string, durationHours: number }}
     */
    getPrice(durationHours) {
        const totalCost = this.strategy.calculatePrice(this.slot, durationHours);
        return {
            totalCost,
            strategyUsed: this.strategy.getStrategyName(),
            durationHours,
        };
    }
}

module.exports = PricingContext;
