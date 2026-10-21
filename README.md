# Driving School Management System

> **A Comprehensive Full-Stack Web Application for Motor Driving Academies**  
> **Degree:** Bachelor of Computer Applications (BCA)  
> **Academic Year:** 2026 – 2027  
> **Institution:** Royal Education Society's College of Computer Science and Information Technology, Latur (Autonomous) [COCSIT]  
> **Affiliated University:** Swami Ramanand Teerth Marathwada University (SRTMUN), Nanded  
> **Candidate:** Radheya Bharat Khandelwal (Div: B, Roll No: B 27)  
> **Project Guide:** Mr. Sayyed Saad B | **HOD:** Dr. V. V. Bhosale  

---

## 📌 Project Overview

The **Driving School Management System** is an end-to-end web portal engineered to eliminate manual paper registers, phone appointment logs, and double-booked training cars in regional motor driving academies. 

The application streamlines student admissions, course selection (Two-Wheeler MCWG, Four-Wheeler LMV, Commercial HMV), conflict-free behind-the-wheel slot scheduling, daily lesson attendance odometry, RTO traffic mock quiz simulations, and automated digital fee invoice receipt generation in PDF format.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite), JavaScript | Modern component architecture, responsive vanilla CSS design system |
| **Backend API** | Node.js, Express.js | RESTful layered architecture, JWT authentication, parameterized SQL queries |
| **Database** | TiDB Cloud / MySQL 8.x | 9 Relational Master Tables with foreign key constraints & conflict prevention |
| **Reporting** | PDFKit & ExcelJS | Digital PDF payment receipts and Excel (.xlsx) analytical summaries |
| **Security** | bcryptjs, jsonwebtoken | Salted password hashing, stateless role-based authorization |

---

## 🏛️ System Architecture & 9 Core Database Tables

The application implements all 9 master tables approved in the capstone project synopsis:

1. **`UserMaster`**: Handles user authentication, profile data, roles (`Admin`, `Instructor`, `Student`), and RTO Learner License (LLR) records.
2. **`CourseMaster`**: Stores training catalogs (MCWG, LMV-Manual, LMV-Auto, Combo packages), theory/practical hour requirements, and fee schedules.
3. **`InstructorMaster`**: Certified driving instructor profiles, licenses, shift hours, and vehicle fleet allocations.
4. **`VehicleMaster`**: Fleet assets, registration numbers, transmission types, dual-control equipment flags, fitness, and insurance expiry dates.
5. **`SessionMaster`**: Standard batch time slot definitions (Morning & Evening sessions).
6. **`BookingMaster`**: Practical driving reservations enforcing strict relational conflict prevention for instructors and vehicles.
7. **`AttendanceMaster`**: Odometry logs (kilometers driven), competency evaluations (1 to 5 stars), and instructor feedback.
8. **`TestScheduleMaster`**: Traffic rules mock quizzes and official RTO practical license test results.
9. **`PaymentMaster`**: Financial transaction ledger, simulated checkouts, and PDF invoice generation.

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js**: `v18+` (Tested on `v24.18.0`)
- **npm**: `v10+` (Tested on `v11.16.0`)
- **Git**: `v2.40+`

### 1. Clone the Repository
```bash
git clone https://github.com/Cherrywoff/DRIVING-SCHOOL-MANAGEMENT-SYSTEM.git
cd DRIVING-SCHOOL-MANAGEMENT-SYSTEM
```

### 2. Configure Environment Variables
Copy the environment template in the `server` folder:
```bash
cp server/.env.example server/.env
```
Open `server/.env` and configure your database and authentication settings:
```ini
PORT=5000
NODE_ENV=development
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=driving_school_db
DB_SSL=true
JWT_SECRET=your_long_random_jwt_secret_key_minimum_32_chars
CLIENT_URL=http://localhost:5173
```
*(Note: Never commit `.env` containing actual passwords to version control. Keep `.env` in `.gitignore`.)*

### 3. Install Dependencies
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
cd ..
```

### 4. Database Setup & Seeding
```bash
# Verify database connection
npm run db:test

# Execute migrations to create 9 master tables
npm run db:migrate

# Seed realistic demonstration records
npm run db:seed
```

### 5. Running the Application Locally
In two separate terminals:

**Terminal 1 (Backend REST API):**
```bash
npm run server
# API starts at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend React App):**
```bash
npm run client
# Frontend runs at: http://localhost:5173
```

---

## 👥 Default Demo Credentials (For College Viva & Testing)

| Role | Email Address | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@drivingschool.com` | `Admin@123` | Full dashboard, fleet management, instructors, Excel exports |
| **Instructor** | `rajesh.patil@drivingschool.com` | `Instructor@123` | Assigned driving sessions, student attendance logging, evaluations |
| **Student** | `radheya.khandelwal@student.com` | `Student@123` | Slot booking, course enrollment, mock quiz, PDF receipts |

---

## 🧪 Verified Functional Modules

- [x] **Module 1: Student Registration & Authentication:** Bcrypt hashed passwords, JWT token sessions, role separation.
- [x] **Module 2: Driving Courses & Vehicle Categories:** Dynamic course pricing, syllabus hours breakdown, vehicle category mapping.
- [x] **Module 3: Instructor & Fleet Scheduling:** Vehicle assignment, dual-pedal control auditing, fitness & insurance tracking.
- [x] **Module 4: Practical Training Booking & Attendance:** Conflict prevention (prevents simultaneous instructor or vehicle double-booking), odometry km logging, 1-5 star competency ratings.
- [x] **Module 5: Evaluations & RTO Mock Quiz:** 5-question Indian RTO scenario quiz with real-time scoring, explanations, and database logging.
- [x] **Module 6: Fees & Reporting:** Simulated payment checkout, instant downloadable PDF receipts, and Excel (.xlsx) roster exports.