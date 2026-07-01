const bookingRepo = require('../repositories/BookingRepository');
const slotRepo = require('../repositories/ParkingSlotRepository');
const bookingEmitter = require('../observers/BookingEventEmitter');
const PricingContext = require('../strategies/PricingContext');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Protected
const createBooking = async (req, res) => {
    const { parkingSlotId, startTime, endTime } = req.body;
    try {
        // --- Repository Pattern: slot lookup via ParkingSlotRepository ---
        const slot = await slotRepo.findById(parkingSlotId);
        if (!slot) {
            return res.status(404).json({ message: 'Parking slot not found' });
        }
        if (!slot.isAvailable) {
            return res.status(400).json({ message: 'Parking slot is already occupied' });
        }

        // --- Strategy Pattern: calculate price using the appropriate pricing strategy ---
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationHours = (end - start) / (1000 * 60 * 60);
        const pricingContext = new PricingContext(slot);
        const pricing = pricingContext.getPrice(durationHours);

        // --- Repository Pattern: booking creation via BookingRepository ---
        const booking = await bookingRepo.create({
            user: req.user.id,
            parkingSlot: parkingSlotId,
            startTime,
            endTime,
        });

        // --- Observer Pattern: emit event; SlotAvailabilityObserver handles the side-effect ---
        await bookingEmitter.notify('booking.created', { slot, booking });

        const bookingData = typeof booking.toObject === 'function' ? booking.toObject() : booking;
        res.status(201).json({
            ...bookingData,
            totalCost: pricing.totalCost,
            strategyUsed: pricing.strategyUsed,
            durationHours: pricing.durationHours,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Protected
const getUserBookings = async (req, res) => {
    try {
        // --- Repository Pattern: query via BookingRepository ---
        const bookings = await bookingRepo.findByUser(req.user.id);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking times
// @route   PUT /api/bookings/:id
// @access  Protected
const updateBooking = async (req, res) => {
    const { startTime, endTime } = req.body;
    try {
        // --- Repository Pattern: lookup via BookingRepository ---
        const booking = await bookingRepo.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Check if the booking belongs to the authenticated user
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this booking' });
        }

        booking.startTime = startTime || booking.startTime;
        booking.endTime = endTime || booking.endTime;

        // --- Repository Pattern: persist via BookingRepository ---
        const updatedBooking = await bookingRepo.save(booking);
        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete/Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Protected
const deleteBooking = async (req, res) => {
    try {
        // --- Repository Pattern: lookup via BookingRepository ---
        const booking = await bookingRepo.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Check if the booking belongs to the authenticated user
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to cancel this booking' });
        }

        // --- Repository Pattern: fetch slot via ParkingSlotRepository ---
        const slot = await slotRepo.findById(booking.parkingSlot);

        // --- Observer Pattern: emit event; SlotAvailabilityObserver restores availability ---
        if (slot) {
            await bookingEmitter.notify('booking.cancelled', { slot });
        }

        // --- Repository Pattern: delete via BookingRepository ---
        await bookingRepo.deleteById(req.params.id);
        res.status(200).json({ message: 'Booking cancelled and slot released' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    updateBooking,
    deleteBooking,
};
