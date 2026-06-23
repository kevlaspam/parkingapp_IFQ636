
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
        const defaultSlots = [
            // QUT Gardens Point Campus Slots (9 slots)
            { slotNumber: 'GP-A1', location: 'QUT Gardens Point - Block S', pricePerHour: 5.50, isAvailable: true },
            { slotNumber: 'GP-B4', location: 'QUT Gardens Point - Science Center', pricePerHour: 6.00, isAvailable: true },
            { slotNumber: 'GP-C2', location: 'QUT Gardens Point - Main Drive', pricePerHour: 4.50, isAvailable: true },
            { slotNumber: 'GP-D9', location: 'QUT Gardens Point - Library V-Block', pricePerHour: 5.00, isAvailable: true },
            { slotNumber: 'GP-E3', location: 'QUT Gardens Point - P-Block Undercover', pricePerHour: 7.00, isAvailable: true },
            { slotNumber: 'GP-F1', location: 'QUT Gardens Point - River Terrace', pricePerHour: 5.20, isAvailable: true },
            { slotNumber: 'GP-G6', location: 'QUT Gardens Point - Z-Block Lot', pricePerHour: 4.80, isAvailable: true },
            { slotNumber: 'GP-H8', location: 'QUT Gardens Point - Old Parliament House Lane', pricePerHour: 6.50, isAvailable: true },
            { slotNumber: 'GP-I2', location: 'QUT Gardens Point - Gardens Theatre Lane', pricePerHour: 5.80, isAvailable: true },
            
            // QUT Kelvin Grove Campus Slots (9 slots)
            { slotNumber: 'KG-A8', location: 'QUT Kelvin Grove - Block F', pricePerHour: 4.00, isAvailable: true },
            { slotNumber: 'KG-B2', location: 'QUT Kelvin Grove - Sports Complex', pricePerHour: 4.20, isAvailable: true },
            { slotNumber: 'KG-C5', location: 'QUT Kelvin Grove - Creative Industries', pricePerHour: 4.50, isAvailable: true },
            { slotNumber: 'KG-D3', location: 'QUT Kelvin Grove - Ring Road', pricePerHour: 3.80, isAvailable: true },
            { slotNumber: 'KG-E1', location: 'QUT Kelvin Grove - Library R-Block', pricePerHour: 4.10, isAvailable: true },
            { slotNumber: 'KG-F4', location: 'QUT Kelvin Grove - Visual Arts Lot', pricePerHour: 3.90, isAvailable: true },
            { slotNumber: 'KG-G7', location: 'QUT Kelvin Grove - Health Clinic Parking', pricePerHour: 4.30, isAvailable: true },
            { slotNumber: 'KG-H9', location: 'QUT Kelvin Grove - Victoria Park Lane', pricePerHour: 4.00, isAvailable: true },
            { slotNumber: 'KG-I6', location: 'QUT Kelvin Grove - Carraway St Link', pricePerHour: 4.40, isAvailable: true },
            
            // Suburbs & Council Partnership Slots (8 slots)
            { slotNumber: 'SUB-M1', location: 'Milton - Park Road (Council Partner)', pricePerHour: 3.50, isAvailable: true },
            { slotNumber: 'SUB-M2', location: 'Milton - Railway Terrace (Council Partner)', pricePerHour: 3.40, isAvailable: true },
            { slotNumber: 'SUB-SB3', location: 'South Brisbane - Grey St (Council Partner)', pricePerHour: 3.70, isAvailable: true },
            { slotNumber: 'SUB-SB4', location: 'South Brisbane - Glenelg St (Council Partner)', pricePerHour: 3.60, isAvailable: true },
            { slotNumber: 'SUB-RH2', location: 'Red Hill - Musgrave Road (Council Partner)', pricePerHour: 3.20, isAvailable: true },
            { slotNumber: 'SUB-RH3', location: 'Red Hill - Windsor Road (Council Partner)', pricePerHour: 3.10, isAvailable: true },
            { slotNumber: 'SUB-WE1', location: 'West End - Boundary St (Council Partner)', pricePerHour: 3.30, isAvailable: true },
            { slotNumber: 'SUB-WE2', location: 'West End - Montague Road (Council Partner)', pricePerHour: 3.20, isAvailable: true }
        ];

        for (const slot of defaultSlots) {
            await ParkingSlot.updateOne(
                { slotNumber: slot.slotNumber },
                { $setOnInsert: slot },
                { upsert: true }
            );
        }
        console.log('Sample parking slots verified/seeded successfully');
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
