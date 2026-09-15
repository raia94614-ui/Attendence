# AttendX — Smart Attendance Management System

A modern, high-performance, frontend-only Attendance Management System built with **React 18**, **Vite**, **Tailwind CSS v4**, **Lucide Icons**, and **Recharts**.

> **IMPORTANT**: This is a 100% frontend-only web application. There is **no backend server, Express, Node API, Firebase, Supabase, or external database**. All data is persisted directly in your browser's `localStorage` and automatically loaded on every page refresh.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

---

## 🔑 Demo Login Accounts

Instant 1-click login buttons are available on the login page, or sign in using:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@attendx.com` | `admin123` | Full institute control, course & student management, analytics, global settings |
| **Teacher** | `teacher@attendx.com` | `teacher123` | Faculty portal, mark lecture attendance, class history, student watchlist |
| **Student** | `student@attendx.com` | `student123` | Student portal, subject breakdown, deficit warnings, attendance slip export |

---

## ✨ Features & Architecture

### 📊 Role-Based Dashboards
- **Admin Dashboard**: Real-time KPI stats (Students, Teachers, Subjects, Overall Attendance %), 30-day timeline trend chart, subject comparison bars, status distribution donut chart, low attendance watchlist (<75%), and recent session logs.
- **Teacher Dashboard**: Assigned course cards, 1-click "Mark Class" shortcuts, class averages, and submission history.
- **Student Dashboard**: Individual attendance percentage, classes needed to reach 75% threshold, subject-by-subject progress cards, personal lecture log, and printable attendance slips.

### 📝 Advanced Attendance Marking
- Class selector (Subject, Semester, Section, Date, Time Slot, Room).
- Duplicate prevention: Automatically detects existing sessions for the same class and date with edit mode support.
- Quick bulk actions: **Mark All Present**, **Mark All Absent**, **Mark All Late**, **Clear**.
- Per-student status toggles: **Present**, **Absent**, **Late**, **Excused**.
- Per-student remarks/notes input (e.g. medical leave, late entry).
- Live session summary counter with celebration confetti on high attendance.

### 📅 Interactive Monthly Calendar
- Full month calendar view with color-coded day status indicators (Green: Present, Red: Absent, Yellow: Late, Blue: Excused).
- Interactive Day Inspector modal to view all lecture sessions conducted on any selected date.

### 👥 Student & Faculty Management
- Full CRUD management for students and faculty.
- Multi-field filters: Department, Semester (1-8), Section (A-D), and live search.
- Student detail drawer with subject-wise attendance breakdown, deficit warnings, and log history.

### 📈 Recharts Analytics & Visualizations
- 30-day attendance timeline area chart.
- Subject-by-subject performance bar chart.
- Status distribution pie/donut chart.
- Department-by-department comparison chart.
- Weekday attendance pattern (Monday to Friday averages).

### 📑 Reports & Pure Frontend Export
- Daily session reports, Monthly summaries, Student-wise rosters, and Subject master statements.
- **CSV Export**: Generated 100% in frontend JavaScript using `Blob` and dynamic URL downloads.
- **Print Statement**: Optimized print layout (`window.print()`) for college attendance slips and official transcripts.

### 💾 LocalStorage Management & Disaster Recovery
- Storage quota counter (KB used, record counts).
- **Export Full JSON Backup**: Download entire database as a structured JSON file.
- **Import JSON Backup**: Safely restore database from a previously exported JSON backup.
- **Reset to Demo Seeds**: Reseeds realistic students, courses, and attendance logs.
- **Clear Records**: Complete data purge with confirmation protection.

---

## 📁 Clean Folder Structure

```
src/
├── assets/
├── components/
│   ├── analytics/
│   │   ├── AttendanceTrendChart.jsx
│   │   ├── StatusDonutChart.jsx
│   │   └── SubjectWiseChart.jsx
│   ├── attendance/
│   │   └── StatusBadge.jsx
│   ├── common/
│   │   ├── Badge.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   ├── Modal.jsx
│   │   └── StatCard.jsx
│   ├── layout/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── QuickSearchModal.jsx
│   │   └── Sidebar.jsx
│   ├── students/
│   │   ├── StudentDetailModal.jsx
│   │   └── StudentModal.jsx
│   ├── subjects/
│   │   └── SubjectModal.jsx
│   └── teachers/
│       └── TeacherModal.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
├── data/
│   └── demoData.js
├── pages/
│   ├── AdminDashboard.jsx
│   ├── AnalyticsPage.jsx
│   ├── AttendanceMarkingPage.jsx
│   ├── AttendanceRecordsPage.jsx
│   ├── CalendarPage.jsx
│   ├── LoginPage.jsx
│   ├── ReportsPage.jsx
│   ├── SettingsPage.jsx
│   ├── StudentDashboard.jsx
│   ├── StudentsPage.jsx
│   ├── SubjectsPage.jsx
│   └── TeacherDashboard.jsx
├── utils/
│   ├── calculations.js
│   ├── csvExport.js
│   ├── dateUtils.js
│   └── storage.js
├── App.jsx
├── index.css
└── main.jsx
```
