# CampusAttend — Smart College Attendance Management System

**CampusAttend** is a full-stack engineering college attendance management platform built with React, Node.js/Express, Prisma ORM, and SQLite/PostgreSQL.

---

## 🚀 System Architecture & Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router DOM v6
- **Backend API**: Node.js, Express.js, JWT, bcryptjs, Helmet, Morgan, Zod, Rate Limiting
- **Database & ORM**: Prisma ORM, SQLite (`dev.db` for instant local zero-config runnability) / PostgreSQL compatible
- **Security**: JWT Authentication, Role-Based Access Control (RBAC), bcrypt password hashing, Audit Logging, HTTP security headers

---

## 🔑 Demo Accounts (Pre-seeded Demo Data)

Default password for all demo accounts: `Password123!`

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **Admin** | `admin@campusattend.local` | Principal / HOD Admin Portal |
| **Faculty** | `faculty@campusattend.local` | Dr. K. Sharma (Prof & HOD CSE) |
| **Student** | `student@campusattend.local` | Rahul Sharma (Roll: 21A01, CSE-A) |

---

## 💻 Quick Start & Running Locally

### 1. Start Backend Server (Port 5000)

```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

### 2. Start Frontend Server (Port 5173)

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## ✨ Key Features Implemented

1. **Authentication & Security**:
   - Secure login with JWT & bcrypt
   - Role-Based Access Control (`ADMIN`, `FACULTY`, `STUDENT`)
   - Protected frontend routes and API endpoints

2. **Faculty Attendance Flow**:
   - Quick attendance marking interface
   - Subject, Section, Date, Hour selection
   - Quick batch actions ("Mark All Present", "Clear All")
   - Student status toggles: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`
   - Pre-submission Review Modal with live statistics count
   - Automatic duplicate session prevention (`subjectId_sectionId_date_hour` unique index)

3. **Student Portal**:
   - Dashboard with overall attendance donut chart and subject cards
   - Shortage warning badge (< 75% requirement)
   - Monthly trend line chart and timetable viewer
   - Personal attendance history log

4. **College Administration**:
   - College dashboard with department attendance overview and shortage watchlist
   - Student Management (CRUD + search + filter + CSV bulk import)
   - Faculty Management & Faculty-Subject-Section mapping
   - Department, Course, Section, and Subject Management
   - College-wide Attendance Session inspection & authorized record correction
   - Tamper-evident Audit Logs (`AuditLog` table tracking old value, new value, reason, user ID, timestamp)
   - CSV Attendance Report Generation
