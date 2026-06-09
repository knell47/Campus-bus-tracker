# Campus-bus-tracker# 
CampusFlow — Live Bus Tracking System
**Project Report & Technical Pitch Document**

## 1. Executive Summary
**CampusFlow** is a robust, real-time bus tracking and transit management system designed specifically for the **ITER Campus, Bhubaneswar**. It solves the common problem of transit uncertainty by providing students with a live view of their college buses, and it gives the administration a streamlined way to manage routes and drivers.

The system is split into two primary interfaces:
- **Student Portal**: A tracking dashboard where students can see live bus locations on a map, check expected arrivals, and indicate their pickup stops to help manage crowd levels.
- **Driver Dashboard**: A secure portal for bus drivers to broadcast their live GPS location and manage route assignments.

---

## 2. Technology Stack (Data Stack)
The project utilizes a modern, lightweight, and scalable stack (MERN stack without React, using Vanilla JS for performance).

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | HTML5, CSS3, Vanilla JS | High-performance, lightweight client-side rendering without framework overhead. |
| **Maps & GIS** | Leaflet.js | Open-source interactive maps for rendering live bus coordinates and route paths. |
| **Backend API** | Node.js (v18+), Express.js | Handling RESTful API requests, authentication, and serving core logic. |
| **Real-time Engine** | Socket.io | Bi-directional, low-latency communication for live GPS broadcasting. |
| **Database** | MongoDB & Mongoose | Flexible NoSQL document storage for routes, stops, and user credentials. |
| **Authentication** | JWT, bcryptjs, Google Auth | Secure session management, password hashing, and OAuth 2.0 integration. |

---

## 3. Database Architecture (Data Models)
The system uses MongoDB to store and retrieve data efficiently. Below are the core schemas:

### A. Student Schema (`Student.js`)
Handles student authentication and profile data.
- `name`: Full name of the student.
- `regNumber`: Alphanumeric registration number (e.g., college ID), uniquely identifying the student.
- `address`: Student's address.
- `email` & `googleId`: Used for Google OAuth login.
- `password`: Securely hashed (using bcrypt with 10 salt rounds) before saving.

### B. Route Schema (`Route.js`)
Manages bus routes, drivers, and schedules.
- `routeId`: Unique identifier for the bus route.
- `busNumber`: The physical number/license plate of the bus.
- `driver` & `conductor`: Nested objects containing name and phone numbers.
- `stoppages`: Array of stop objects containing `name` and `time` of arrival.
- `classTime`, `arrivalAtIter`, `departureFromIter`: Scheduling metadata.

---

## 4. Working Methods & System Architecture

The architecture follows a **Client-Server-Database** model enhanced with a **Real-Time WebSocket Layer**.

### 4.1. Driver Workflow (Data Ingestion)
1. **Authentication**: The driver logs in using a secure, pre-configured `DRIVER_PIN`. A JSON Web Token (JWT) valid for 12 hours is generated.
2. **GPS Polling**: The frontend uses the HTML5 Geolocation API to continuously monitor the driver's device coordinates.
3. **Broadcasting**: The coordinates are emitted to the Node.js server via a Socket.io event named `send-location`.

### 4.2. Student Workflow (Data Consumption)
1. **Authentication**: Students register/login via standard password or Google OAuth. A 24-hour JWT is issued.
2. **Dashboard Initialization**: The student portal fetches route data (`/api/routes`) and stops (`/api/stops`) via REST API calls.
3. **Live Tracking**: The student's browser connects to the Socket.io server and listens for `receive-location` events, instantly updating the bus marker on the Leaflet map.
4. **Crowd Management**: Students can trigger a `set-pickup` event to notify the system of their intended stop, which broadcasts a `crowd-update` event to help drivers anticipate passenger loads.

---

## 5. Security & Protection Mechanisms
To ensure the system cannot be abused, several enterprise-grade security layers have been implemented:

- **Password Protection**: Plain-text passwords are never stored. They are hashed using **bcrypt** (10 salt rounds).
- **Brute-Force Prevention**: `express-rate-limit` is used to restrict login attempts (max 15 attempts per 15 minutes).
- **Data Sanitization**: `express-mongo-sanitize` prevents NoSQL injection attacks by stripping prohibited characters from user inputs.
- **Header Security**: `helmet` is deployed to secure HTTP headers against cross-site scripting (XSS) and clickjacking.
- **CORS Protection**: The API strictly enforces Cross-Origin Resource Sharing (CORS), ensuring only the official domain can interact with the backend.
- **Stateless Auth**: JWT ensures the server remains stateless while keeping driver and student sessions secure.

---

## 6. Key Selling Points for the College Pitch
If you are pitching this to the ITER administration, highlight these benefits:
1. **Cost-Effective**: Uses open-source technologies (Leaflet, MongoDB, Node.js). No expensive third-party tracking software licenses are needed.
2. **Student Safety & Convenience**: Reduces wait times at bus stops and provides peace of mind.
3. **Crowd Prediction**: The `set-pickup` feature allows the transport department to predict which stops will have the most students on a given day.
4. **Easy Driver Onboarding**: Drivers do not need complex training; they just open a web link, enter a PIN, and leave their phone on the dashboard.
5. **Highly Scalable**: The architecture is designed to handle thousands of concurrent real-time connections using Socket.io and can be easily deployed on cloud platforms like Railway, Render, or an Ubuntu VPS.
