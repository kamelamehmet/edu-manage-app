In this file you will find all the requirements I need to build for the project. Please follow these when building the project.

EduManage – Course & Student Management System
📝 General Application Description
Project Title: EduManage – Course & Student Management System
Tech Stack: React.js (frontend) + PocketBase (backend)
🎯 Overview
EduManage is a web-based platform for managing educational activities such as course creation, student enrollment, grading, payments, and scheduling. It supports three roles: admin, teacher, and student, each with specific permissions.
🧩 Key Features
User Authentication & Authorization (with role-based access)
Course Management: create, edit, and assign teachers/students
Student Management: view profiles, grades, and payments
Grade Management: teachers assign and update grades
Payment Tracking: record student payments with status
Class Scheduling: manage and view course sessions
Real-Time Updates: optional live sync with PocketBase subscriptions
👥 User Roles
Admin: Full access, including user creation and system configuration
Teacher: Manages their own courses, grades, and schedule
Student: Can view their enrolled courses, grades, and payments
🔧 PHASE 1: Project Setup
✅ General Setup
[ ]  Initialize Git repository
[ ]  Create monorepo structure (optional) or separate frontend/ and backend/
[ ]  Set up environment variables (.env files)
🧠 PocketBase Setup
[ ]  Download and run PocketBase
[ ]  Configure PocketBase admin panel access
[ ]  Create initial admin user
⚛️ React Setup
[ ]  Create React project (create-react-app or Vite)
[ ]  Install dependencies (axios, react-query, react-router-dom,react query, MUI (Vapor 3), zustand or redux, pocketbase)
[ ]  Set up folder structure (pages/, components/, services/, etc.)
[ ]  Create a global API service wrapper for PocketBase
🧱 PHASE 2: Backend - PocketBase Data Modeling
🔐 Users Collection (system collection)
[ ]  Enable authentication for users
[ ]  Add custom fields: fullName, avatar, role (select: student, teacher, admin)
[ ]  Add validation rules for each role
📚 Courses Collection
[ ]  Create collection courses
[ ]  Fields: title, description, teacher (relation to users), students (many-to-many to users)
[ ]  Add collection rules (e.g. only teachers/admin can create or edit)
🎓 Students (users with role=student)
[ ]  No separate collection (filtered by user role)
[ ]  Create rule: student can only access their own data
🧑‍🏫 Teachers (users with role=teacher)
[ ]  No separate collection (filtered by user role)
[ ]  Create rule: teacher can access their own courses and student lists
📝 Grades Collection
[ ]  Fields: student (relation), course (relation), value, note
[ ]  Rule: only the course’s teacher can create/update
💳 Payments Collection
[ ]  Fields: student, course, amount, status (select), date
[ ]  Rule: only admin or the student can view
🗓 Schedule Collection
[ ]  Fields: course, startTime, endTime, location
[ ]  Rule: teacher/admin can edit
🧑‍💻 PHASE 3: Frontend - React App
🔐 Authentication
[ ]  Build login form
[ ]  Build register form
[ ]  Auth context/provider to manage session and roles
[ ]  Protected routes for different roles
[ ]  Logout functionality
🏠 Dashboard
[ ]  Create dashboard route
[ ]  Admin: Show summary (total users, courses, pending payments)
[ ]  Student: Show enrolled courses and upcoming classes
[ ]  Teacher: Show assigned courses and upcoming schedule
📚 Courses Module
[ ]  View all courses (based on role)
[ ]  Create/Edit/Delete course (admin/teacher)
[ ]  Enroll students to a course
[ ]  View course details and list of students
👨‍🎓 Students Module (admin-only)
[ ]  List all students
[ ]  View student profile (including grades and payments)
[ ]  Edit student info
[ ]  Assign student to course
👩‍🏫 Teachers Module (admin-only)
[ ]  List all teachers
[ ]  View teacher profile (including courses they teach)
[ ]  Assign teacher to course
📝 Grades Module
[ ]  View all grades (admin)
[ ]  Teachers: Assign/update grades to their students
[ ]  Students: View their own grades only
💳 Payments Module
[ ]  View all payments (admin)
[ ]  Create/edit payments (admin)
[ ]  Students: View their own payment history/status
🗓 Schedule Module
[ ]  View course schedules (per user)
[ ]  Create/edit/delete schedule entries (admin/teacher)
[ ]  Calendar UI integration (e.g. react-big-calendar
✨ PHASE 4: Advanced Features (Optional)
[ ]  Add file upload for user avatars (PocketBase file field)
[ ]  Real-time updates for new grades or payments (using pb.subscribe)
[ ]  Export grades to Excel (CSV)
[ ]  Notification system (new grade, payment reminder)
[ ]  Stripe integration for live payments
[ ]  Theme switcher (light/dark mode)
📦 Final Tasks
[ ]  Build and deploy React app (Vercel, Netlify, etc.)
[ ]  Bundle PocketBase as standalone binary (pocketbase serve --http 0.0.0.0:8090)
[ ]  Set up hosting (optional: DigitalOcean, Render, etc.)
[ ]  Write documentation (README.md)