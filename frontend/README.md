# ParkEase — Frontend

React 18 mobile-first web app for the Parking Slot Booking System (IFQ636).

## Overview

The frontend renders as a **realistic smartphone mockup** in the browser — designed to demonstrate a mobile parking app experience. It communicates with the Express/MongoDB backend via Axios.

## Tech

- **React 18** with React Router v6
- **Vanilla CSS** custom design system (`src/index.css`)
- **Axios** for API calls (`src/axiosConfig.jsx` — dynamic base URL for local/production)
- **Plus Jakarta Sans** font (Google Fonts)

## Design System

All styles live in `src/index.css`. Key design tokens:

| Token | Value |
|-------|-------|
| Background | `#0a0a0f` |
| Card | `#16161f` |
| Accent (violet) | `#7c3aed` |
| Success (green) | `#10b981` |
| Danger (red) | `#ef4444` |
| Font | Plus Jakarta Sans |

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | JWT login form |
| Register | `/register` | User registration |
| Dashboard | `/dashboard` | Browse + book available slots |
| My Bookings | `/bookings` | View, reschedule, cancel reservations |
| Profile | `/profile` | Edit account details |
| Admin Panel | `/admin` | Admin CRUD for slots/bookings |

## Scripts

```bash
npm start        # Dev server on :3000
npm run build    # Production build → ./build
npm test         # Run tests
```

## Key Implementation Notes

- **Phone frame** (`App.js`): Uses `transform: translateZ(0)` to create a CSS containing block so `position: fixed` modals/toasts render inside the frame, not the browser viewport.
- **Bottom navigation** (`components/Navbar.jsx`): Tab bar only shown when user is authenticated.
- **Booking modal** (`pages/Dashboard.jsx`): Bottom sheet with live duration preview.
- **Reschedule modal** (`pages/MyBookings.jsx`): Inline bottom sheet, no browser `prompt()` or `alert()`.
- **Profile avatars**: Generated from user name initials with gradient background.
