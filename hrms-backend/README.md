# HRMS Backend (MERN Stack)

Backend API for the Human Resource Management System, built with Node.js, Express, and MongoDB (Mongoose). Implements auth, role-based access control (Admin/Employee), employee profiles, attendance tracking, leave management, and payroll — matching the functional requirements document.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI`: your local or Atlas MongoDB connection string
   - `JWT_SECRET`: any long random string
   - `EMAIL_*`: SMTP credentials (Gmail App Password, Mailtrap, or SendGrid work well for dev)

3. Run in development (auto-restarts on file changes):
   ```bash
   npm run dev
   ```
   Or in production:
   ```bash
   npm start
   ```

4. Confirm it's running:
   ```bash
   curl http://localhost:5000/api/health
   ```

## Project Structure

```
config/db.js            MongoDB connection
models/                 Mongoose schemas (User, Employee, Attendance, Leave, Payroll)
controllers/            Business logic for each module
routes/                 Express route definitions
middleware/             JWT auth, role-based access control, error handling
utils/                  JWT signing, email sending
server.js               App entry point
```

## Authentication

All protected routes require a header:
```
Authorization: Bearer <token>
```
The token is returned from `/api/auth/login` after a verified account logs in successfully.

## API Reference

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/signup` | Public | Register (employeeId, email, password, fullName, role) |
| GET | `/verify/:token` | Public | Verify email from the link sent at signup |
| POST | `/login` | Public | Log in, returns JWT |

### Employees (`/api/employees`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/me` | Employee | View own profile |
| PUT | `/me` | Employee | Edit own phone/address/profilePic only |
| GET | `/` | Admin | List all employees |
| GET | `/:id` | Admin | View any employee's full profile |
| PUT | `/:id` | Admin | Edit any employee's full details |

### Attendance (`/api/attendance`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/checkin` | Employee | Check in for today |
| POST | `/checkout` | Employee | Check out (auto-marks half-day if <4h worked) |
| GET | `/me?month=&year=` | Employee | View own attendance, optional month filter |
| GET | `/all?employeeId=&month=&year=` | Admin | View all/filtered attendance |
| POST | `/mark` | Admin | Manually set an employee's attendance status |

### Leave (`/api/leave`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/apply` | Employee | Apply for leave (type, startDate, endDate, remarks) |
| GET | `/me` | Employee | View own leave requests |
| GET | `/all?status=` | Admin | View all/filtered leave requests |
| PATCH | `/:id/status` | Admin | Approve/reject a request; auto-syncs Attendance |

### Payroll (`/api/payroll`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/me` | Employee | View own payroll history (read-only) |
| GET | `/all?employeeId=` | Admin | View all/filtered payroll records |
| POST | `/` | Admin | Create/update salary for an employee for a month |

## Design Notes

- **Password rules**: enforced at signup — min 8 chars, upper, lower, number, special character.
- **Leave → Attendance sync**: approving a leave request automatically writes `status: 'leave'` Attendance entries for each day in the range, so the employee's attendance calendar reflects it without a manual step.
- **Role escalation guard**: the `role` field in `/signup` should be locked down further in production (e.g. only allow `admin` role via an existing admin's invite, not open self-registration) — currently any signup can claim role `admin`, which is fine for local development/testing but should be restricted before going live.
- **Half-day rule**: if checkout happens less than 4 hours after check-in, status auto-updates to `half-day`. Adjust the threshold in `attendanceController.js` as needed.

## Not Included (Next Steps)

- File upload endpoints for documents/profile pictures (Multer is installed but routes aren't wired up yet — happy to add if needed)
- Rate limiting / request throttling
- Automated test suite (Jest/Supertest)
- Frontend (React) — see earlier discussion in this conversation for planned structure
