const EventEmitter = require('events');
const SlotAvailabilityObserver = require('./SlotAvailabilityObserver');

/**
 * BookingEventEmitter - Subject class for the Observer Pattern.
 *
 * Extends Node.js's built-in EventEmitter to act as the Subject (publisher)
 * in the Observer pattern. It maintains a list of BookingObserver instances
 * and notifies them when booking lifecycle events occur.
 *
 * Event names emitted:
 *   - 'booking.created'   → payload: { slot, booking }
 *   - 'booking.cancelled' → payload: { slot }
 *
 * Design:
 *   - Controllers call emitter.notify(event, data) to broadcast events
 *   - All registered observers are called asynchronously in sequence
 *   - New behaviours can be added by registering additional observers
 *     without touching the controller or existing observers
 */
class BookingEventEmitter extends EventEmitter {
    constructor() {
        super();
        /** @type {import('./BookingObserver')[]} */
        this._observers = [];

        // Register the default observer that manages slot availability
        this.registerObserver(new SlotAvailabilityObserver());
    }

    /**
     * Register a new observer to be notified on booking events.
     * @param {import('./BookingObserver')} observer
     */
    registerObserver(observer) {
        this._observers.push(observer);
    }

    /**
     * Remove a previously registered observer.
     * @param {import('./BookingObserver')} observer
     */
    removeObserver(observer) {
        this._observers = this._observers.filter(o => o !== observer);
    }

    /**
     * Notify all registered observers of a booking event.
     * Awaits each observer in sequence so errors can be caught per-observer.
     * @param {string} event - The event name (e.g. 'booking.created')
     * @param {Object} data  - Event payload
     * @returns {Promise<void>}
     */
    async notify(event, data) {
        for (const observer of this._observers) {
            try {
                await observer.update(event, data);
            } catch (err) {
                console.error(`[BookingEventEmitter] Observer error on "${event}":`, err.message);
            }
        }
        // Also emit on the Node EventEmitter for any standard .on() listeners
        this.emit(event, data);
    }
}

// Export a single shared instance so all controllers use the same emitter
module.exports = new BookingEventEmitter();
