const Booking = require('../models/Booking');

/**
 * BookingRepository - Repository Pattern implementation for Booking data access.
 *
 * Encapsulates all Mongoose queries for the Booking model behind a clean
 * ES6 class interface. Controllers never interact with the Booking model directly;
 * they go through this repository, following the Repository Pattern.
 *
 * Benefits:
 *   - Single place to change query logic (e.g. add caching, change ORM)
 *   - Easier to mock/stub in unit tests
 *   - Demonstrates encapsulation (OOP principle)
 */
class BookingRepository {
    /**
     * Retrieve all bookings belonging to a specific user, with slot data populated.
     * @param {string} userId - The authenticated user's MongoDB ObjectId
     * @returns {Promise<Booking[]>}
     */
    async findByUser(userId) {
        return Booking.find({ user: userId }).populate('parkingSlot');
    }

    /**
     * Find a single booking by its MongoDB _id.
     * @param {string} bookingId
     * @returns {Promise<Booking|null>}
     */
    async findById(bookingId) {
        return Booking.findById(bookingId);
    }

    /**
     * Create a new booking document.
     * @param {{ user: string, parkingSlot: string, startTime: Date, endTime: Date }} data
     * @returns {Promise<Booking>}
     */
    async create(data) {
        return Booking.create(data);
    }

    /**
     * Persist changes to an existing booking document.
     * @param {Booking} booking - A Mongoose document with modified fields
     * @returns {Promise<Booking>}
     */
    async save(booking) {
        return booking.save();
    }

    /**
     * Delete a booking by its MongoDB _id.
     * @param {string} bookingId
     * @returns {Promise<Object>} Mongoose deletion result
     */
    async deleteById(bookingId) {
        return Booking.deleteOne({ _id: bookingId });
    }
}

module.exports = new BookingRepository();
