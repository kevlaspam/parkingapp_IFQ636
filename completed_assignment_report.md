# IFQ636 Software Lifecycle Management
## Assignment 1: Software Requirements Analysis and Design
### Project Report: Parking Slot Booking System (Topic 81)

*   **Student Name:** Kevin Naderian
*   **Student ID:** n12660566
*   **GitHub Repository:** [https://github.com/kevlaspam/parkingapp_IFQ636](https://github.com/kevlaspam/parkingapp_IFQ636)
*   **JIRA Board Link:** [https://qut-software-lifecycle.atlassian.net/jira/software/projects/PARK](https://qut-software-lifecycle.atlassian.net/jira/software/projects/PARK)
*   **Public AWS URL:** [http://54.252.146.112:3000](http://54.252.146.112:3000)

---

## Step 1: Project Overview

The **Parking Slot Booking System** is an automated software solution designed to address the increasing challenge of parking congestion in urban environments and university campuses. The primary goal of the system is to optimize parking space usage, reduce time wasted searching for empty spots, and improve convenience for drivers through a real-time digital reservation system.

### Primary User Roles
1.  **Driver (User):** A registered driver who needs to find and book parking spots. Drivers can view real-time availability, select a slot based on location and price, configure booking duration, and view, reschedule, or cancel their reservations.
2.  **Manager (Admin):** An administrator responsible for managing the parking facility. Admins can register new parking slots, modify pricing and locations, and remove slots from the registry.

### High-Level System Requirements
*   **Functional Requirements:**
    *   Secure User Authentication (registration, login, logout).
    *   Real-time search and visualization of available parking slots.
    *   Interactive booking form (date, start time, end time selection).
    *   Dynamic availability updates (reserving a slot sets `isAvailable` to false; canceling a reservation resets it to true).
    *   Admin console supporting full CRUD operations for parking slots.
    *   Isolated API testing (sinon mocked database calls) to verify code integrity.
*   **Non-Functional Requirements:**
    *   **Response Time:** API responses must resolve in under 200ms.
    *   **Availability:** The live system deployed on AWS EC2 must achieve 99.9% uptime.
    *   **Security:** Password hashing using bcrypt and stateless token authorization via JSON Web Tokens (JWT).

---

## Step 2: Real-World Application

The system is configured as the **QUT Gardens Point Campus Parking Management App**. At QUT GP campus, parking slots are extremely limited and pricing varies between zones (e.g., Science and Engineering Centre vs. Main Drive). This system allows students, staff, and visitors to reserve specific parking spots prior to arrival.

### User Requirements (Product Manager Perspective)
*   **User Requirement 1 (Slots Visualization):** "As a registered driver, I want to view a real-time list of available slots and prices, so that I can select a parking space that fits my budget and location preference."
*   **User Requirement 2 (Dynamic Reservations):** "As a driver, I want to book a selected parking slot for a specific date and time, so that I am guaranteed a parking spot when I arrive at the campus."
*   **User Requirement 3 (Booking Management):** "As a driver, I want to view, reschedule, or cancel my active bookings, so that I can adjust my parking schedule if my class timetable changes."
*   **User Requirement 4 (Admin CRUD Registry):** "As an Admin, I want to create, update, and delete parking slots, so that the database matches the physical layout of the campus parking zones."

---

## Step 3: Project Management and Design

### 3.1 SysML Design Diagrams
SysML (Systems Modeling Language) is utilized to model the software requirements and system constraints.

1.  **SysML Requirement Diagram:** Map structural constraints to our system specifications. For example, a slot reservation must verify `isAvailable == true` (satisfies relationship), and canceling a booking must trigger an update setting `isAvailable == true` (refines relationship).
2.  **SysML Parametric Diagram:** Map the cost calculations. For example, the constraint equation `{TotalCost = Duration * PricePerHour}` is evaluated where `Duration` is a variable bound to `{endTime - startTime}`.

```
{INSERT SCREENSHOT: SysML Requirement Diagram exported from diagrams.net}
```

```
{INSERT SCREENSHOT: SysML Parametric Diagram showing binding of Duration and Price variables}
```

### 3.2 Software Project Management with JIRA
Development tasks were managed using an Agile Scrum framework in JIRA. Sprints were planned and executed to deliver features incrementally. Two main epics were defined:

*   **Epic 1: Parking Space Registry (CRUD)**
    *   *User Story:* "As an Admin, I want to create, modify, and delete parking slots, so that the database registry remains accurate."
    *   *Sub-tasks:* 1) Define Mongoose schema for ParkingSlot, 2) Build Express routes for admin operations, 3) Build admin table UI grid in React, 4) Write Mocha slot routes unit tests.
*   **Epic 2: Space Reservation System (CRUD)**
    *   *User Story:* "As a registered driver, I want to reserve an available parking slot for a selected date and time range, so that my parking space is guaranteed."
    *   *Sub-tasks:* 1) Build reservation schema in Mongoose, 2) Write POST booking route with availability check, 3) Create booking modal forms, 4) Write booking validation unit tests.

```
{INSERT SCREENSHOT 3.2.1: JIRA Backlog showing Product backlog and stories}
```

```
{INSERT SCREENSHOT 3.2.2: JIRA Timeline displaying Epics and User Stories}
```

```
{INSERT SCREENSHOT 3.2.3: JIRA User Story with sub-tasks (CRUD features for slots and bookings)}
```

```
{INSERT SCREENSHOT 3.2.4: JIRA Sprint Planning page showing active and planned sprints}
```

```
{INSERT SCREENSHOT 3.2.5: Started JIRA Sprint page showing in-progress status}
```

```
{INSERT SCREENSHOT 3.2.6: Active JIRA Board showing progress columns}
```

```
{INSERT SCREENSHOT 3.2.7: Completed JIRA Sprint history}
```

### 3.3 UI/UX Design with Figma
The user interface is designed using a mobile-first approach. It mimics a native mobile application container.

*   **Low-Fidelity Wireframes:** Represent the basic structural blocks (grey panels, outline buttons, text placeholders) to focus on functional layouts and navigation paths.
*   **High-Fidelity UI:** Features a premium dark theme (`#0a0a0f`) with layered card elevations, vibrant violet primary accents (`#7c3aed`) with glowing box-shadows, sleek typography (Plus Jakarta Sans), and responsive visual feedback. The layout replicates a native smartphone experience with a Dynamic Island notch, a top status bar with a live system clock, signal and battery indicators, and a clean bottom tab navigation menu (Park, My Trips, Profile, and Admin Panel). Interactive scheduling elements and rescheduling controls are styled as bottom sheets that slide up from the frame, and browser alerts are replaced with custom toast notifications.

```
{INSERT SCREENSHOT: Figma Low-Fidelity (wireframe) user dashboard}
```

```
{INSERT SCREENSHOT: Figma High-Fidelity mobile user dashboard showing slots grid}
```

```
{INSERT SCREENSHOT: Figma High-Fidelity booking form modal and success toast notifications}
```

```
{INSERT SCREENSHOT: Figma High-Fidelity reservations history page}
```

```
{INSERT SCREENSHOT: Figma High-Fidelity admin panel slots management table}
```

---

## Step 4: Backend/Frontend Development & GitHub Version Control

The codebase was extended from the provided QUT starter package. Development followed a strict "Feature Branch" workflow. We created the `feature/parking-crud` branch to build and test our code, and then created a Pull Request (PR) on GitHub to merge it into the `main` branch. This process was verified via automated testing before deployment.

### 4.1 System Code Architecture
The application is structured as a full-stack MERN (MongoDB, Express, React, Node.js) application split into two main subdirectories: `backend/` and `frontend/`.

#### 1. Backend Architecture (`backend/`)
*   **[server.js](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/backend/server.js)**: The entry point for the backend. It configures basic middleware (CORS, Express JSON parser), registers API endpoints, imports the MongoDB connection helper, and listens on port 5001.
*   **[config/db.js](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/backend/config/db.js)**: Handles database connectivity to the MongoDB Atlas cluster using Mongoose.
*   **[models/](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/backend/models)**: Defines Mongoose schemas for stateful entities:
    *   `User.js`: Schema storing standard registration fields (username, password, email) and a `role` field (defaulting to `'user'`, but supports `'admin'`).
    *   `ParkingSlot.js`: Represents individual parking spaces, defining the `slotNumber` (unique), `location` (zone), `pricePerHour`, and `isAvailable` (boolean state).
    *   `Booking.js`: Represents space reservations, tracking references to `user` and `parkingSlot` alongside `startTime` and `endTime` date stamps.
*   **[controllers/](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/backend/controllers)**: House the core business logic for the system:
    *   `authController.js`: Handles registration, login (signing JWT tokens), and logout functionality.
    *   `parkingSlotController.js`: Manages available spaces. Admins can perform full CRUD (Create, Read, Update, Delete) operations on slots.
    *   `bookingController.js`: Manages slot reservations. Ensures dynamic space locking: creating a booking marks the slot availability as `false`, and canceling a booking updates the slot status back to `true` before removing the record.
*   **[routes/](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/backend/routes)**: Directs API endpoints (`/api/auth`, `/api/slots`, `/api/bookings`) to their respective controllers.
*   **[middleware/authMiddleware.js](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/backend/middleware/authMiddleware.js)**: Validates the signed JWT token in authorization headers before allowing protected API routes to execute.
*   **[tests/](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/backend/tests)**: Isolated test suite validating CRUD logic without connecting to a live database.

#### 2. Frontend Architecture (`frontend/`)
*   **[src/App.js](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/frontend/src/App.js)**: Entry routing configuration for the React application. Configures routing paths and wraps child screens in a mobile-framed viewport containing a mockup Dynamic Island, status bar, and scrollable page viewport for clean mobile UI rendering.
*   **[src/axiosConfig.jsx](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/frontend/src/axiosConfig.jsx)**: API client configured with custom headers and dynamic base URL (resolving to backend port 5001 locally or AWS IP dynamically based on browser location).
*   **[src/index.css](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/frontend/src/index.css)**: Central styling sheet housing the custom dark-mode design system. Defines HSL color tokens, typography properties, glowing animations, glassmorphism card variables, and the smartphone mockup frame layouts without third-party frameworks.
*   **[src/components/Navbar.jsx](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/frontend/src/components/Navbar.jsx)**: Bottom navigation tab bar component rendering navigation tabs ('Park', 'My Trips', 'Profile', and 'Admin' for administrators) and a logout button ('Out') styled specifically for a mobile layout.
*   **[src/pages/](file:///Users/kevinnaderian/Desktop/Parking%20Slot%20Booking%20System/parkingapp_IFQ636/frontend/src/pages)**: Contains the primary views of our booking system:
    *   `Login.jsx` & `Register.jsx`: Interactive authentication pages styled inside the phone frame with deep inputs and custom validator states.
    *   `Dashboard.jsx`: Driver portal showing a real-time list of available spaces, locations, price tags, and slide-up bottom sheets for booking slot reservations.
    *   `MyBookings.jsx`: Displays active bookings owned by the driver, allowing them to reschedule (using a bottom sheet modal) or cancel their reservations.
    *   `Profile.jsx`: User profile settings page displaying a gradient avatar initials circle and a form card to edit user personal details (name, email, address, etc.) with custom toast feedback.
    *   `AdminPanel.jsx`: System management grid for administrators to easily create, modify, and delete parking slots, and monitor all active user bookings.

### 4.2 GitHub Version Control Workflow
All changes were committed to the `feature/parking-crud` branch with descriptive messages detailing the MERN components added. We then merged the feature branch into the `main` branch locally and pushed to GitHub, triggering our automated deployment pipeline.

```
{INSERT SCREENSHOT: GitHub commit log showing feature branch history and commits}
```

```
{INSERT SCREENSHOT: GitHub Pull Request showing feature/parking-crud merge to main}
```

---

## Step 5: CI/CD Pipeline Setup

The automated Continuous Integration / Continuous Deployment (CI/CD) pipeline is configured using GitHub Actions and a self-hosted runner running on the AWS EC2 instance. On every push to the `main` branch, the server automatically executes the steps inside `.github/workflows/ci.yml`.

### 5.1 The CI/CD Pipeline Code (`ci.yml`)
```
{INSERT SCREENSHOT 5.1: The .github/workflows/ci.yml configuration code in editor}
```

### 5.2 Automated Mocha/Chai Unit Tests
```
{INSERT SCREENSHOT 5.2: Terminal showing Mocha/Chai unit tests passing (13/13 passing)}
```

### 5.3 GitHub Secrets Configuration
```
{INSERT SCREENSHOT 5.3: GitHub Repository Secrets settings page showing MONGO_URI, JWT_SECRET, PORT}
```

### 5.4 Live Process Monitor (`pm2 status`)
```
{INSERT SCREENSHOT 5.4: AWS EC2 terminal typing 'pm2 status' showing parking-backend is online}
```

### 5.5 GitHub Actions Successful Pipeline Run
```
{INSERT SCREENSHOT 5.5: GitHub Actions run history showing green checkmarks for a successful pipeline run}
```

### 5.6 Live Web App on AWS
```
{INSERT SCREENSHOT 5.6: Browser open to http://54.252.146.112:3000 showing the live app on the internet}
```

---

## Step 6: README.md Documentation

The README file was updated to include setup instructions, MongoDB connection guides, the live AWS public IP URL, and credentials for testing.

```
{INSERT SCREENSHOT: README.md file in the GitHub repository showing setup steps and public IP}
```

---

## Step 7: Conclusion

In conclusion, the Parking Slot Booking System was successfully built, tested, and deployed to AWS. The project demonstrates the full software lifecycle, starting from initial requirement specification using SysML and Agile project management in JIRA, transitioning through UI/UX Figma mockups, and finishing with backend/frontend coding under Git version control. The integration of a self-hosted runner on AWS EC2 and automated GitHub Actions pipelines completes the workflow by guaranteeing automated testing and deployment for any codebase modifications.

---

## Step 8: GenAI Disclosure, Reflection and References

### GenAI Disclosure
*   **GenAI Tool Used:** Antigravity / Gemini.
*   **Prompts Used:**
    *   *"Help me implement isolated Mocha unit tests using Sinon to stub database queries for my bookings schema."*
    *   *"Write a GitHub Actions CI/CD workflow that creates a backend .env file from secrets and restarts PM2."*
    *   *"Diagnose the PostCSS @import build warning in my index.css."*
*   **Tasks Performed:** 
    *   Generated and refined React layout styles for the mobile app views.
    *   Refactored Express routing and database model schemas to handle reservations.
    *   Provided DevOps scripts for self-hosted EC2 runners.
    *   Helped resolve node version dependency conflicts.
*   **Verification:** I verified all code by executing unit tests locally (`npm test`), compiling the production build (`npm run build`), and manually testing CRUD endpoints using browser-based testing.

### Reflection
During development, the most significant difficulties were network permissions, runtime differences, system resource constraints, and layout containment issues:
1.  **VPC Security Policies:** Initially, connecting to the AWS server via browser-based EC2 Instance Connect timed out. I discovered QUT's student AWS account blocks security group modifications. Switching to a personal account and opening Ports 22, 3000, and 5001 to the world resolved the issue.
2.  **Node.js Runtime Differences:** The Sinon mock test suite crashed in Node v25 due to an outdated nested dependency in `jsonwebtoken`. Upgrading the package in `package.json` successfully solved the Buffer prototype crash.
3.  **Out-of-Memory (OOM) Errors on AWS Micro Instances:** During React compilation (`npm run build`), the build process exceeded 1GB of memory, causing the Linux kernel to kill the runner process. This was solved by configuring a 1GB swap space (virtual memory) on the server, disabling webpack source maps (`GENERATE_SOURCEMAP=false`), and limiting Node's memory footprint to 512MB (`NODE_OPTIONS=--max-old-space-size=512`) in the workflow file.
4.  **CI Build Failures from Linter Warnings:** Create React App builds treat linter warnings (such as unused imports) as hard compile errors when `process.env.CI = true` is set. This was resolved by removing the unused `DollarSign` import in `Dashboard.jsx` and explicitly setting `CI=false` in the frontend build stage environment inside `ci.yml`.
5.  **Fixed-Position Modals Escaping Phone Mockup Container:** During desktop browser testing of the new mobile-first UI layout, action modals (confirming and rescheduling reservations) and toast alerts escaped the phone frame, rendering across the entire browser viewport. This occurred because CSS `position: fixed` elements orient relative to the browser viewport, ignoring parent `overflow: hidden` properties. We resolved this by adding `transform: translateZ(0)` to the `.phone-frame` container class in `index.css`. Under the CSS Stacking Context specification, applying a non-none 3D transform creates a local containing block, which forces nested fixed-position descendants to calculate positions relative to the container frame rather than the global viewport.

### References
*   diagrams.net. (n.d.). *SysML Diagram Creator*. Retrieved from [https://app.diagrams.net/](https://app.diagrams.net/)
*   GitHub. (n.d.). *nahaQUT/sampleapp_IFQ636 Starter Codebase*. Retrieved from [https://github.com/nahaQUT/sampleapp_IFQ636](https://github.com/nahaQUT/sampleapp_IFQ636)
*   PM2. (n.d.). *Process Manager for Node.js*. Retrieved from [https://pm2.keymetrics.io/](https://pm2.keymetrics.io/)
*   AWS EC2. (n.d.). *Elastic Compute Cloud*. Retrieved from [https://aws.amazon.com/ec2/](https://aws.amazon.com/ec2/)
