// frontend/src/utils/localDb.js

const DEFAULT_SLOTS = [
  // QUT Gardens Point Campus Slots (10 slots)
  { _id: 'local-gp-1', slotNumber: 'GP-A1', location: 'QUT Gardens Point - Block S', pricePerHour: 5.50, isAvailable: true },
  { _id: 'local-gp-2', slotNumber: 'GP-B4', location: 'QUT Gardens Point - Science Center', pricePerHour: 6.00, isAvailable: true },
  { _id: 'local-gp-3', slotNumber: 'GP-C2', location: 'QUT Gardens Point - Main Drive', pricePerHour: 4.50, isAvailable: true },
  { _id: 'local-gp-4', slotNumber: 'GP-D9', location: 'QUT Gardens Point - Library V-Block', pricePerHour: 5.00, isAvailable: false },
  { _id: 'local-gp-5', slotNumber: 'GP-E3', location: 'QUT Gardens Point - P-Block Undercover', pricePerHour: 7.00, isAvailable: true },
  { _id: 'local-gp-6', slotNumber: 'GP-F1', location: 'QUT Gardens Point - River Terrace', pricePerHour: 5.20, isAvailable: true },
  { _id: 'local-gp-7', slotNumber: 'GP-G6', location: 'QUT Gardens Point - Z-Block Lot', pricePerHour: 4.80, isAvailable: true },
  { _id: 'local-gp-8', slotNumber: 'GP-H8', location: 'QUT Gardens Point - Old Parliament House Lane', pricePerHour: 6.50, isAvailable: false },
  { _id: 'local-gp-9', slotNumber: 'GP-I2', location: 'QUT Gardens Point - Gardens Theatre Lane', pricePerHour: 5.80, isAvailable: true },
  { _id: 'local-gp-10', slotNumber: 'GP-J5', location: 'QUT Gardens Point - Block Y Area', pricePerHour: 5.00, isAvailable: true },

  // QUT Kelvin Grove Campus Slots (10 slots)
  { _id: 'local-kg-1', slotNumber: 'KG-A8', location: 'QUT Kelvin Grove - Block F', pricePerHour: 4.00, isAvailable: true },
  { _id: 'local-kg-2', slotNumber: 'KG-B2', location: 'QUT Kelvin Grove - Sports Complex', pricePerHour: 4.20, isAvailable: true },
  { _id: 'local-kg-3', slotNumber: 'KG-C5', location: 'QUT Kelvin Grove - Creative Industries', pricePerHour: 4.50, isAvailable: true },
  { _id: 'local-kg-4', slotNumber: 'KG-D3', location: 'QUT Kelvin Grove - Ring Road', pricePerHour: 3.80, isAvailable: false },
  { _id: 'local-kg-5', slotNumber: 'KG-E1', location: 'QUT Kelvin Grove - Library R-Block', pricePerHour: 4.10, isAvailable: true },
  { _id: 'local-kg-6', slotNumber: 'KG-F4', location: 'QUT Kelvin Grove - Visual Arts Lot', pricePerHour: 3.90, isAvailable: true },
  { _id: 'local-kg-7', slotNumber: 'KG-G7', location: 'QUT Kelvin Grove - Health Clinic Parking', pricePerHour: 4.30, isAvailable: true },
  { _id: 'local-kg-8', slotNumber: 'KG-H9', location: 'QUT Kelvin Grove - Victoria Park Lane', pricePerHour: 4.00, isAvailable: true },
  { _id: 'local-kg-9', slotNumber: 'KG-I6', location: 'QUT Kelvin Grove - Carraway St Link', pricePerHour: 4.40, isAvailable: true },
  { _id: 'local-kg-10', slotNumber: 'KG-J2', location: 'QUT Kelvin Grove - Block K Lot', pricePerHour: 4.15, isAvailable: true },

  // Suburbs & Council Partnership Slots (10 slots)
  { _id: 'local-sub-1', slotNumber: 'SUB-M1', location: 'Milton - Park Road (Council Partner)', pricePerHour: 3.50, isAvailable: true },
  { _id: 'local-sub-2', slotNumber: 'SUB-M2', location: 'Milton - Railway Terrace (Council Partner)', pricePerHour: 3.40, isAvailable: true },
  { _id: 'local-sub-3', slotNumber: 'SUB-SB3', location: 'South Brisbane - Grey St (Council Partner)', pricePerHour: 3.70, isAvailable: true },
  { _id: 'local-sub-4', slotNumber: 'SUB-SB4', location: 'South Brisbane - Glenelg St (Council Partner)', pricePerHour: 3.60, isAvailable: false },
  { _id: 'local-sub-5', slotNumber: 'SUB-RH2', location: 'Red Hill - Musgrave Road (Council Partner)', pricePerHour: 3.20, isAvailable: true },
  { _id: 'local-sub-6', slotNumber: 'SUB-RH3', location: 'Red Hill - Windsor Road (Council Partner)', pricePerHour: 3.10, isAvailable: true },
  { _id: 'local-sub-7', slotNumber: 'SUB-WE1', location: 'West End - Boundary St (Council Partner)', pricePerHour: 3.30, isAvailable: true },
  { _id: 'local-sub-8', slotNumber: 'SUB-WE2', location: 'West End - Montague Road (Council Partner)', pricePerHour: 3.20, isAvailable: true },
  { _id: 'local-sub-9', slotNumber: 'SUB-WE3', location: 'West End - Vulture St (Council Partner)', pricePerHour: 3.50, isAvailable: true },
  { _id: 'local-sub-10', slotNumber: 'SUB-TO1', location: 'Toowong - Benson St (Council Partner)', pricePerHour: 3.60, isAvailable: true }
];

const DEFAULT_BOOKINGS = [
  {
    _id: 'local-b1',
    user: 'student-built-in',
    parkingSlot: { slotNumber: 'GP-D9', location: 'QUT Gardens Point - Library V-Block', pricePerHour: 5.00 },
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endTime: new Date(Date.now() + 14400000).toISOString() // 4 hours from now
  },
  {
    _id: 'local-b2',
    user: 'student-built-in',
    parkingSlot: { slotNumber: 'KG-D3', location: 'QUT Kelvin Grove - Ring Road', pricePerHour: 3.80 },
    startTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    endTime: new Date(Date.now() + 18000000).toISOString() // 5 hours from now
  }
];

export function initializeLocalDb() {
  if (!localStorage.getItem('local_slots')) {
    localStorage.setItem('local_slots', JSON.stringify(DEFAULT_SLOTS));
  }
  if (!localStorage.getItem('local_bookings')) {
    localStorage.setItem('local_bookings', JSON.stringify(DEFAULT_BOOKINGS));
  }
}

export function getLocalSlots() {
  initializeLocalDb();
  return JSON.parse(localStorage.getItem('local_slots') || '[]');
}

export function saveLocalSlots(slots) {
  localStorage.setItem('local_slots', JSON.stringify(slots));
}

export function getLocalBookings() {
  initializeLocalDb();
  return JSON.parse(localStorage.getItem('local_bookings') || '[]');
}

export function saveLocalBookings(bookings) {
  localStorage.setItem('local_bookings', JSON.stringify(bookings));
}
