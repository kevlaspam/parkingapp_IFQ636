# ParkEase — Parking Slot Booking System

**IFQ636 Assessment 1.2 — Full-Stack CRUD Application with DevOps Practices**
<<<<<<< HEAD
**Student:** Naidu
=======
**Student:** Naderian123
>>>>>>> 38561ea90f2735ed691746e5803023335bc5da0e
**GitHub Repo:** [kevlaspam/parkingapp_IFQ636](https://github.com/kevlaspam/parkingapp_IFQ636)

---

## Overview

**ParkEase** is a full-stack mobile-first web application that allows university students and staff to browse, book, manage, and cancel parking slots in real time. The system includes a user-facing mobile UI and a protected admin panel, backed by a RESTful API and a cloud-hosted MongoDB database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (cloud) via Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Deployment | AWS EC2 (Ubuntu), PM2 process manager |
| CI/CD | GitHub Actions (automated build + deploy on push to `main`) |
| Version Control | Git + GitHub |

---

## Development Workflow

The project follows a Git feature branch workflow to support collaborative development.

1. Create a dedicated feature branch.
2. Implement and test changes locally.
3. Commit changes using meaningful commit messages.
4. Push the feature branch to GitHub.
5. Create a Pull Request.
6. GitHub Actions automatically validates the build and tests.
7. Merge into the `main` branch following successful review and workflow completion.

This workflow helps maintain a stable production branch while enabling concurrent feature development.

---

## Features Implemented

### User Features (CRUD)
- ✅ **Register / Login** — JWT-based authentication with persistent session
- ✅ **Browse Available Slots** — Live list of available parking spots with location, price and status
- ✅ **Book a Slot** — Select date, start time, end time with live duration preview (Create)
- ✅ **View My Bookings** — See all active reservations with date, time, location and price (Read)
- ✅ **Reschedule a Booking** — Update start and end time on an existing booking (Update)
- ✅ **Cancel a Booking** — Delete a reservation, which frees up the slot (Delete)
- ✅ **Edit Profile** — Update name, email, university, and address

### Admin Features
- ✅ **View all parking slots** — See every slot in the system
- ✅ **Add new slots** — Create parking slots with number, location, price, and status
- ✅ **Edit slots** — Update slot details
- ✅ **Delete slots** — Remove slots from the system
- ✅ **View all bookings** — Admin-level overview of all user bookings
- ✅ **Database seeder** — Backend auto-seeds 10 parking slots on startup if the DB is empty

---

## Recent Improvements

Recent enhancements include:

- Added a booking summary screen before payment confirmation.
- Added a logout confirmation bottom sheet to reduce accidental logouts on mobile devices.
- Improved GitHub Actions workflow reliability through workflow permissions, concurrency control and execution timeouts.
- Enhanced deployment reliability using automated GitHub Actions and PM2 process management.

---

## UI Design

The UI is designed as a **mobile-first phone mockup** — a realistic smartphone frame rendered in the browser, including:
- Dynamic Island (camera pill)
- Status bar with live time, signal and battery icons
- Bottom tab navigation (Park, My Trips, Profile)
- Dark theme with violet (#7c3aed) accent
- Glassmorphism overlays, smooth animations
- Bottom sheet modals (contained inside the phone frame via CSS `transform: translateZ(0)`)
- Toast notifications replacing browser `alert()` dialogs

---

## Project Structure

```
parkingapp_IFQ636/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection
│   ├── controllers/            # Auth, slots, bookings controllers
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # User, ParkingSlot, Booking models
│   ├── routes/                 # API route definitions
│   ├── tests/                  # Backend unit/integration tests
│   └── server.js               # Express entry point + slot seeder
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   └── Navbar.jsx       # Bottom tab bar navigation
        ├── context/
        │   └── AuthContext.js   # JWT auth context
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx    # Browse & book slots
        │   ├── MyBookings.jsx   # View, reschedule, cancel bookings
        │   ├── Profile.jsx      # Edit user profile
        │   └── AdminPanel.jsx   # Admin CRUD interface
        ├── App.js               # Router + phone frame shell
        ├── axiosConfig.jsx      # Dynamic API base URL
        └── index.css            # Full custom CSS design system
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/profile` | Get logged-in user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Parking Slots
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/slots/available` | Get all available slots |
| GET | `/api/slots` | Get all slots (admin) |
| POST | `/api/slots` | Create a slot (admin) |
| PUT | `/api/slots/:id` | Update a slot (admin) |
| DELETE | `/api/slots/:id` | Delete a slot (admin) |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | Get user's bookings |
| PUT | `/api/bookings/:id` | Reschedule a booking |
| DELETE | `/api/bookings/:id` | Cancel a booking |
| GET | `/api/bookings/all` | Get all bookings (admin) |

---

## CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow (`.github/workflows/ci.yml`):

1. Checking out the repository.
2. Installing backend dependencies.
3. Executing backend Mocha/Chai unit tests.
4. Building the React frontend.
5. Uploading the frontend build as an artifact.
6. Connecting securely to the AWS EC2 instance using SSH.
7. Pulling the latest source code.
8. Updating environment variables.
9. Deploying the latest frontend build.
10. Restarting PM2 services.


### Pipeline Run History

| Run | Commit | Status | Description |
|-----|--------|--------|-------------|
| #8 | `a213ed2` | ✅ | feat: complete UI redesign — dark mobile theme with violet accent |
| #7 | `f1401e0` | ✅ | feat: add automatic parking slots database seeder on startup |
| #6 | `afb5649` | ✅ | fix: restart both backend and frontend PM2 services in pipeline |
| #5 | `e8d396c` | ✅ | fix: make API baseURL dynamic based on host name |
| #4 | `6f56872` | ✅ | fix: run PM2 via local project node_modules using npx prefix |
| #3 | `4b081df` | ✅ | fix: remove unused import and set CI=false to allow build warnings |
| #2 | `f76f3d8` | ✅ | perf: prevent React build memory crashes on AWS EC2 micro instances |
| #1 | `da2ba97` | ✅ | feat: remove figma wireframes and enable production UI routes |

---

## Running Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas URI (or local MongoDB)

### Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, PORT in .env
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

---

## Environment Variables

**backend/.env**
```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_SECRET=<your-secret-key>
PORT=5001
```

---

## Deployment (AWS EC2)

The app runs on an AWS EC2 Ubuntu instance managed with PM2:

```bash
pm2 list
# parking-backend  → Node/Express on port 5001
# parking-frontend → serve -s build on port 3000
```

Live URL: `http://<EC2-PUBLIC-IP>:3000`

---

## Assessment Checklist

- [x] Full-Stack CRUD operations (Create, Read, Update, Delete)
- [x] User authentication (JWT)
- [x] User panel (browse, book, manage reservations)
- [x] Admin panel (manage slots and bookings)
- [x] GitHub version control with meaningful commit history
- [x] CI/CD pipeline via GitHub Actions
- [x] Automated deployment to AWS EC2
- [x] Unit/integration tests in `backend/tests/`
- [x] Project documentation (this README)

## License

This project was developed for IFQ636 Software Lifecycle Measurement at Queensland University of Technology (QUT) and is intended for educational purposes.
