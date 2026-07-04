# Human Resource Management System (HRMS)

> **"Every workday, perfectly aligned."**  
> A digitized, comprehensive HR portal designed to streamline core HR operations including employee onboarding, role-based dashboards, attendance tracking, leave management, payroll visibility, and administrative approval workflows.

---

## 🌟 Key Features

### 🔐 Authentication & Role-Based Access
- **Secure Onboarding**: Sign up using Email, Password (with strict security rule enforcement), Company Name, Logo, and custom **Employee ID** (e.g., `EMP-101`, auto-generated if left blank).
- **Dual Role System**: Clean segregation of duties and interfaces between **Admin / HR Officer** and **Employee** roles.

---

### 📊 Role-Based Dashboards
- **👨‍💼 Admin / HR Officer Dashboard**:
  - Searchable, responsive grid of all organizational employees with real-time today's check-in status badges.
  - Interactive **NEW** button launching an instant employee creation modal directly from the dashboard.
  - Full visibility into organizational attendance records and pending leave approvals.
- **👨‍💻 Employee Dashboard**:
  - Interactive **Quick-Access Cards** for immediate navigation to **Profile**, **Attendance**, **Leave Requests**, and **Logout**.
  - **Real-Time Activity & Alerts Panel** tracking daily check-in status (Checked In vs. Pending) and leave allocation availability.

---

### 👤 Employee Profile & Payroll Management
- **💰 Read-Only vs. Editable Payroll Structure**:
  - **Employees** can view their detailed monthly/yearly wage breakdown, salary components (Basic, HRA, Allowances, Bonus), Provident Fund (PF), and Tax deductions in **read-only mode**.
  - **Admins** gain interactive controls and a **"Save Salary Structure"** button to dynamically update and persist employee salary components.
- **📝 Interactive Contact & Job Details**:
  - Employees can toggle **"Edit Info"** to update their personal Phone Number and Address.
  - Admins retain full editing privileges over departmental assignment, designation, reporting manager, and work location.

---

### 🗓️ Leave & Time-Off Management
- **Visual Calendar Application**: Apply for **Paid**, **Sick**, or **Unpaid** leaves by selecting date ranges directly on an interactive calendar view.
- **Remarks & Medical Certificates**: Employees can attach detailed reasons/remarks and upload medical certificates (files/images) for sick leave verification.
- **Admin Review Table**: Dedicated review table for HR Officers featuring employee remarks and downloadable document verification links (**"View Cert"**) before approving or rejecting requests.
- **Live Calendar Synchronization**: Approved leave days automatically populate as `Leave` markers on organizational attendance calendars.

---

### ⏰ Attendance Tracking
- **One-Click Check-In / Check-Out**: Seamless time tracking integrated directly into the top navigation bar.
- **Monthly & Weekly Views**: Track attendance history with distinct status indicators (**Present**, **Absent**, **Half-day**, **Leave**).
- **Unrestricted HR Oversight**: Admins can browse, search, and audit attendance records across any historical month or year.

---

## 🛠️ Technology Stack

| Area | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, Axios, React Router DOM |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose Schema), Multer (File & Image Uploads) |
| **Security** | JSON Web Tokens (JWT), Bcrypt Password Hashing, Role-Based Middleware |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/Jeel-dhameliya/Human-Resource-Management-System.git
cd Human-Resource-Management-System
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure environment variables:
```bash
cd hrms-backend
npm install
```

Create a `.env` file in the `hrms-backend/` root directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend development server:
```bash
npm start
# Server will run on http://localhost:5001 with MongoDB connected
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and start the Vite server:
```bash
cd frontend
npm install
npm run dev
# Frontend application will launch on http://localhost:5173
```

---

## 🧪 Testing Role-Based Workflows

1. **Testing Admin Role**:
   - Go to `http://localhost:5173/signup`.
   - Select **Admin / HR Manager** under Account Role.
   - Log in to access the employee management grid, create new employees via the **NEW** button, approve leaves in Time Off, and configure employee salaries.
2. **Testing Employee Role**:
   - Go to `http://localhost:5173/signup` and select **Employee** under Account Role (or create one using the Admin's **NEW** modal).
   - Log in to experience the interactive Quick-Access dashboard cards, check in/out, submit leave requests with remarks, and view your read-only salary structure.

---

## 📁 Repository Structure

```text
Human-Resource-Management-System/
├── frontend/                  # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI (Navbar, EmployeeCard, LeaveModal, LeaveTable, etc.)
│   │   ├── pages/             # Route Views (Dashboard, Login, Signup, EmployeeProfile, Attendance)
│   │   └── ...
│   └── package.json
└── hrms-backend/              # Node.js + Express REST API
    ├── controllers/           # Business Logic (auth, employee, attendance, leave)
    ├── middleware/            # JWT & Role Protection Middleware
    ├── models/                # Mongoose Schemas (User, Employee, Attendance, Leave)
    ├── routes/                # Express API Endpoints
    ├── uploads/               # Local Storage for Logos, Profile Pics, and Medical Certs
    └── server.js              # Application Entry Point
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).