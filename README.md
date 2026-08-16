# ClinicFlow

ClinicFlow is a JavaScript clinic appointment management system built for patients, doctors, clinic admins, and a super admin. It supports appointment booking, doctor scheduling, queue handling, authentication, and role-based access across a React frontend and an Express + MongoDB backend.

## Features

- Patient registration and login
- Clinic and doctor browsing
- Appointment booking with validation
- Doctor schedule management by weekday and time range
- Available time slot generation
- Queue tracking and status updates
- Role-based dashboard and route access
- Clinic and doctor management workflows
- Email confirmation for booked appointments
- Socket.IO real-time queue updates
- Cloudinary image uploads

## User Roles

- Patient: books appointments and views personal appointment details
- Doctor: manages personal schedule and queue
- Clinic Admin: manages a clinic, its doctors, and clinic appointments
- Super Admin: creates clinic admins and oversees clinics, doctors, and appointments

## Tech Stack

### Frontend

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Socket.IO
- Nodemailer
- Cloudinary + Multer
- Argon2 password hashing

## Project Structure

```text
clinicflow/
├── backend/
├── frontend/
├── README.md
```

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:xxxx
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASSWORD=your_mail_password
```

Run backend:

```bash
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

## Environment Variables

Use placeholders only. Example values:

- `MONGO_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
- `CLIENT_URL=http://localhost:5173`
- `CLOUDINARY_API_KEY=your_api_key`
- `MAIL_USER=your_mail_user`
- `VITE_API_URL=http://localhost:5000/api`

## API Overview

Major routes implemented in the backend:

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
POST /api/auth/create-clinic-admin

GET /api/clinics
GET /api/clinics/my-clinic
GET /api/clinics/:id
POST /api/clinics
PUT /api/clinics/:id
DELETE /api/clinics/:id

GET /api/doctors
GET /api/doctors/:id
POST /api/doctors
PUT /api/doctors/:id
DELETE /api/doctors/:id

POST /api/appointments
GET /api/appointments
GET /api/appointments/slots
GET /api/appointments/:id
PUT /api/appointments/:id
DELETE /api/appointments/:id

GET /api/queue
PATCH /api/queue/:appointmentId/status
```

## Appointment Flow

1. Patient selects a clinic and doctor.
2. Frontend fetches available slots for that doctor and date.
3. Patient chooses a slot and submits the booking.
4. Backend validates clinic, doctor, schedule, date, and slot availability.
5. Appointment is created with a queue number.
6. Patient receives an appointment confirmation email if sending succeeds.

Appointment statuses used by the app:

```text
PENDING
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
```

## Real-Time Features

Socket.IO is implemented in the backend for live queue room updates. The app emits `queueUpdated` events for rooms such as:

```text
queue:<doctorId>:<date>
```

## Email

Nodemailer is implemented for appointment confirmation emails after successful booking.

## Security

- JWT-based auth using HTTP-only cookies
- Protected routes with `protect` middleware
- Role checks with `authorize(...)` middleware
- Sensitive values must be stored in `.env` files only

## Development

Run backend and frontend separately:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Future Improvements

- Add automated tests
- Improve analytics and reporting
- Expand queue and appointment workflows
