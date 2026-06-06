
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/parkingSlotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

const ParkingSlot = require('./models/ParkingSlot');

const seedSlots = async () => {
    try {
        const count = await ParkingSlot.countDocuments();
        if (count === 0) {
            await ParkingSlot.create([
                { slotNumber: 'GP-A1', location: 'QUT Gardens Point - Block S', pricePerHour: 5.50, isAvailable: true },
                { slotNumber: 'GP-B4', location: 'QUT Gardens Point - Science Center', pricePerHour: 6.00, isAvailable: true },
                { slotNumber: 'GP-C2', location: 'QUT Gardens Point - Main Drive', pricePerHour: 4.50, isAvailable: true },
                { slotNumber: 'KG-A8', location: 'QUT Kelvin Grove - Block F', pricePerHour: 4.00, isAvailable: true }
            ]);
            console.log('Sample parking slots seeded successfully');
        }
    } catch (err) {
        console.error('Error seeding slots:', err);
    }
};

// Export the app object for testing
if (require.main === module) {
    connectDB().then(() => {
        seedSlots();
    });
    // If the file is run directly, start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app
