const BookingObserver = require('./BookingObserver');
const slotRepo = require('../repositories/ParkingSlotRepository');

/**
 * SlotAvailabilityObserver - Concrete observer for the Observer Pattern.
 *
 * Listens for booking lifecycle events and automatically updates the
 * parking slot's availability status via the ParkingSlotRepository.
 *
 * This decouples slot-availability side-effects from the booking controller:
 * the controller only emits an event; this observer is solely responsible
 * for reacting to it.
 *
 * Extends BookingObserver to demonstrate inheritance and polymorphism.
 *
 * Handles:
 *   - 'booking.created'   → marks slot as unavailable (isAvailable: false)
 *   - 'booking.cancelled' → releases slot back to available (isAvailable: true)
 */
class SlotAvailabilityObserver extends BookingObserver {
    /**
     * React to a booking event by updating the slot's availability.
     * @param {string} event - 'booking.created' | 'booking.cancelled'
     * @param {{ slot: Object }} data - Must include the ParkingSlot Mongoose document
     * @returns {Promise<void>}
     */
    async update(event, data) {
        const { slot } = data;

        if (!slot) {
            console.warn(`[SlotAvailabilityObserver] No slot provided for event: ${event}`);
            return;
        }

        if (event === 'booking.created') {
            slot.isAvailable = false;
            await slotRepo.save(slot);
            console.log(`[SlotAvailabilityObserver] Slot ${slot.slotNumber} marked UNAVAILABLE`);

        } else if (event === 'booking.cancelled') {
            slot.isAvailable = true;
            await slotRepo.save(slot);
            console.log(`[SlotAvailabilityObserver] Slot ${slot.slotNumber} released — AVAILABLE`);
        }
    }
}

module.exports = SlotAvailabilityObserver;
