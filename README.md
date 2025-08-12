# Udyam Registration Form

A full-stack web application that replicates the first two steps of the Udyam registration form with a **multi-step flow**, dynamic form generation, validation, and database storage.

## Multi-Step Flow

1. **Step 1: Aadhaar Verification** - Enter 12-digit Aadhaar number → Validate → Send OTP
2. **Step 2: OTP Verification** - Enter 6-digit OTP → Validate → Proceed to PAN
3. **Step 3: PAN Details** - Enter PAN number → Final submission to database

### Demo Credentials
- **Aadhaar**: `123456789012`
- **OTP**: `123456`
- **PAN**: Any valid format (e.g., `ABCDE1234F`)

## Project Structure

```
/data → form_schema.json  
/frontend → Next.js app  
/backend → Express API + Prisma  
```

## Features

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Multi-step form flow** with progress indicator
- Dynamic form generation from JSON schema
- React Hook Form for validation and input handling
- Mobile-first responsive design
- Real-time validation with custom error messages
- Step-by-step navigation with back/forward buttons
- Success/error feedback for each step

### Backend (Node.js + Express + Prisma + SQLite)
- **Multi-step API endpoints** (`/verify-aadhaar`, `/verify-otp`, `/submit`)
- RESTful API with step-by-step validation
- Dummy Aadhaar/OTP validation for demo purposes
- Prisma ORM for database operations
- CORS enabled for frontend communication
- Comprehensive input validation
- Error handling and logging

### Database Schema
- **UdyamSubmission** model with fields:
  - `id` (auto increment)
  - `aadhaar` (12 digits)
  - `otp` (6 digits)
  - `pan` (5 letters + 4 digits + 1 letter)
  - `createdAt` and `updatedAt` timestamps

## Validation Rules

- **Aadhaar**: Exactly 12 digits (`^[0-9]{12}$`)
- **OTP**: Exactly 6 digits (`^[0-9]{6}$`)
- **PAN**: 5 letters + 4 digits + 1 letter (`^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$`)

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run database migration:
   ```bash
   npm run db:migrate
   ```

4. Start the server:
   ```bash
   npm start
   ```
   
   The backend will run on `http://localhost:3001`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

## Testing

### Backend Tests
Run the Jest test suite for backend validation:
```bash
cd backend
npm test
```

Tests cover:
- Invalid Aadhaar validation (wrong length, non-numeric)
- Invalid OTP validation (wrong length, non-numeric)
- Invalid PAN validation (wrong format)
- Missing field validation
- Multiple validation errors
- Successful form submission

## API Endpoints

### POST /verify-aadhaar
Validates Aadhaar number (Step 1).

**Request Body:**
```json
{
  "aadhaar": "123456789012"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your registered mobile number"
}
```

### POST /verify-otp
Validates OTP (Step 2).

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### POST /submit
Final submission with all data (Step 3).

**Request Body:**
```json
{
  "aadhaar": "123456789012",
  "otp": "123456",
  "pan": "ABCDE1234F"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "id": 1,
    "createdAt": "2025-08-12T06:08:07.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": [
    "Aadhaar number must be exactly 12 digits",
    "OTP must be exactly 6 digits"
  ]
}
```

### GET /
Returns API status information.

## Form Schema

The multi-step form is dynamically generated from `/data/form_schema.json`:

```json
{
  "steps": [
    {
      "id": 1,
      "title": "Aadhaar Verification",
      "description": "Enter your 12-digit Aadhaar number",
      "fields": [
        {
          "name": "aadhaar",
          "label": "Aadhaar Number",
          "type": "text",
          "regex": "^[0-9]{12}$",
          "required": true,
          "placeholder": "Enter 12-digit Aadhaar number",
          "errorMessage": "Aadhaar number must be exactly 12 digits"
        }
      ],
      "submitText": "Send OTP",
      "endpoint": "/verify-aadhaar"
    }
  ],
  "dummyData": {
    "validAadhaar": "123456789012",
    "validOtp": "123456"
  }
}
```

## Technologies Used

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, React Hook Form
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: SQLite (development)
- **Testing**: Jest, Supertest
- **Validation**: Custom regex patterns
- **CORS**: Enabled for cross-origin requests

## Development Notes

- The application uses SQLite for development simplicity
- All validation is performed both client-side and server-side
- The form schema allows for easy addition of new fields
- Mobile-first responsive design ensures compatibility across devices
- Comprehensive error handling provides clear user feedback
