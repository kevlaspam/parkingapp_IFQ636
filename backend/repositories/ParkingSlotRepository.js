const ParkingSlot = require('../models/ParkingSlot');

/**
 * ParkingSlotRepository - Repository Pattern implementation for ParkingSlot data access.
 *
 * Encapsulates all Mongoose queries for the ParkingSlot model behind a clean
 * ES6 class interface. Controllers and observers never query ParkingSlot directly;
 * all database interactions go through this repository.
 *
 * Benefits:
 *   - Centralised slot query logic
 *   - Simplifies testing (stubs target Mongoose model, not controller logic)
 *   - Demonstrates encapsulation (OOP principle)
 */
class ParkingSlotRepository {
    /**
     * Fetch all parking slots where isAvailable is true.
     * @returns {Promise<ParkingSlot[]>}
     */
    async findAvailable() {
        return ParkingSlot.find({ isAvailable: true });
    }

    /**
     * Fetch all parking slots (for admin views).
     * @returns {Promise<ParkingSlot[]>}
     */
    async findAll() {
        return ParkingSlot.find({});
    }

    /**
     * Find a single parking slot by its MongoDB _id.
     * @param {string} slotId
     * @returns {Promise<ParkingSlot|null>}
     */
    async findById(slotId) {
        return ParkingSlot.findById(slotId);
    }

    /**
     * Find a parking slot by its human-readable slot number (e.g. "GP-A1").
     * @param {string} slotNumber
     * @returns {Promise<ParkingSlot|null>}
     */
    async findBySlotNumber(slotNumber) {
        return ParkingSlot.findOne({ slotNumber });
    }

    /**
     * Create a new parking slot document.
     * @param {{ slotNumber: string, location: string, pricePerHour: number, isAvailable?: boolean }} data
     * @returns {Promise<ParkingSlot>}
     */
    async create(data) {
        return ParkingSlot.create(data);
    }

    /**
     * Persist changes to an existing parking slot document.
     * @param {ParkingSlot} slot - A Mongoose document with modified fields
     * @returns {Promise<ParkingSlot>}
     */
    async save(slot) {
        return slot.save();
    }

    /**
     * Delete a parking slot by its MongoDB _id.
     * @param {string} slotId
     * @returns {Promise<Object>} Mongoose deletion result
     */
    async deleteById(slotId) {
        return ParkingSlot.deleteOne({ _id: slotId });
    }
}

module.exports = new ParkingSlotRepository();
