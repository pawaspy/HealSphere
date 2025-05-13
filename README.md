# VitaReach Telehealth Platform

A modern telehealth platform that connects patients with doctors for virtual consultations.

## Project Structure

```
├── Backend/             # Go backend API
│   ├── api/             # API handlers and routes
│   ├── db/              # Database migrations and queries
│   │   ├── migration/   # SQL migrations
│   │   └── sqlc/        # SQLC-generated Go code
│   ├── token/           # Paseto token functionality
│   └── util/            # Utility functions
└── Frontend/            # React frontend
    ├── public/          # Static assets
    └── src/
        ├── components/  # UI components
        ├── hooks/       # Custom React hooks
        ├── pages/       # Page components
        └── utils/       # Utility functions
```

## Technologies Used

### Backend
- Go with Gin framework
- PostgreSQL database
- SQLC for type-safe SQL
- PASETO/JWT for authentication
- Migrate for database migrations

### Frontend
- React 18
- Vite
- React Router
- shadcn/ui components
- Tailwind CSS
- Lucide React icons

## Setup Instructions

### Prerequisites
- Go 1.24 or higher
- Node.js 16 or higher
- PostgreSQL 14 or higher

### Database Setup
1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE vitareach;
   ```

2. Run migrations:
   ```bash
   cd Backend
   migrate -path db/migration -database "postgresql://username:password@localhost:5432/vitareach?sslmode=disable" -verbose up
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Build and run:
   ```bash
   go build -o vitareach
   ./vitareach
   ```
   
   The backend will start on port 3000.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   
   The frontend will start on port 8080.

## API Endpoints

### Patient Endpoints
- `POST /patients` - Register a new patient
- `POST /patients/login` - Patient login
- `GET /patients/profile` - Get patient profile
- `PUT /patients/profile` - Update patient profile
- `PATCH /patients/password` - Update patient password
- `DELETE /patients` - Delete patient account
- `GET /patients/check-username/:username` - Check if username exists
- `GET /patients/check-email/:email` - Check if email exists

### Doctor Endpoints
- `POST /doctors` - Register a new doctor
- `POST /doctors/login` - Doctor login
- `GET /doctors` - List doctors (with pagination)
- `GET /doctors/profile` - Get doctor profile
- `PUT /doctors/profile` - Update doctor profile
- `PATCH /doctors/password` - Update doctor password
- `DELETE /doctors` - Delete doctor account
- `GET /doctors/check-username/:username` - Check if username exists
- `GET /doctors/check-email/:email` - Check if email exists

## Features

### Patient Features
- Registration and login
- View and update profile information
- Delete account
- Browse and search for doctors
- Book appointments
- Filter appointments by status (upcoming, completed, all)
- Join video calls initiated by doctors
- View and download prescriptions

### Doctor Features
- Registration and login
- View and update professional profile
- Delete account
- Manage appointments
- Filter appointments by status (upcoming, completed, all)
- Initiate video calls with patients
- Write and manage prescriptions
- View patient history and details

### Common Features
- Secure authentication
- Profile management
- Real-time validation
- Responsive UI design
- Smart appointment management that hides completed appointments by default
- Video consultation capabilities

## Development

### Generate SQLC Code

```bash
cd Backend
sqlc generate
```

### Adding New Migrations

```bash
migrate create -ext sql -dir db/migration -seq add_new_feature
```

## Cross-Origin Resource Sharing (CORS)

The backend includes CORS configuration to allow requests from the frontend. In the development environment, all origins are allowed, but in production, this should be restricted to your domain.

## Authentication

The application uses PASETO tokens for authentication. When a user logs in, they receive an access token that must be included in the Authorization header for protected endpoints.

## Frontend-Backend Integration

The frontend communicates with the backend through the API utilities in `src/utils/api.js`. This provides a consistent interface for all API calls and handles authentication tokens automatically.

## Video Consultation Workflow

The platform implements a structured video consultation workflow:

1. **Appointment Booking**: Patients book appointments with doctors, specifying whether they prefer online or in-person consultation.

2. **Doctor-Initiated Calls**: Only doctors can initiate video calls for online appointments. This ensures consultations happen at scheduled times and prevents unauthorized access.

3. **Patient Join**: Once a doctor initiates a call, the patient's dashboard updates to show an active "Join Video Call" button. Before this, patients see a disabled "Waiting for Doctor" button.

4. **Completed Appointments**: After consultation, appointments are marked as "completed" and automatically filtered out from the default dashboard view. Users can still access completed appointments through the status filter.

5. **Post-Consultation**: Doctors can write prescriptions for completed appointments, which patients can view and download from their dashboard.

This workflow ensures a clear process for telehealth consultations while maintaining security and proper medical protocols.