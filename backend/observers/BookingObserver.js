/**
 * BookingObserver - Abstract base class for the Observer Pattern.
 *
 * Any class that wants to react to booking lifecycle events (created, cancelled)
 * must extend BookingObserver and implement the update() method.
 *
 * This demonstrates:
 *   - Abstraction: the interface is defined here, behaviour in subclasses
 *   - Polymorphism: multiple observers can react differently to the same event
 *   - Open/Closed Principle: new observers can be added without modifying existing code
 */
class BookingObserver {
    /**
     * Called by the BookingEventEmitter when a booking event occurs.
     * @param {string} event - The event name (e.g. 'booking.created', 'booking.cancelled')
     * @param {Object} data  - Event payload (e.g. { slot, booking })
     * @returns {Promise<void>}
     * @throws {Error} If not overridden by a concrete subclass
     */
    async update(event, data) {
        throw new Error(
            `update() must be implemented by a concrete BookingObserver subclass. ` +
            `"${this.constructor.name}" has not implemented it.`
        );
    }
}

module.exports = BookingObserver;
