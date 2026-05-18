import React from "react";
import { Routes, Route } from "react-router-dom";

/* ================= LAYOUTS ================= */

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

/* ================= PROTECTED ROUTE ================= */

import ProtectedRoute from "../components/ProtectedRoute";

/* ================= PUBLIC PAGES ================= */

import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";

/* ================= EMPLOYEE PAGES ================= */

import Dashboard from "../pages/employee/Dashboard";
import ApplyLeave from "../pages/employee/ApplyLeave";
import MyLeaves from "../pages/employee/MyLeaves";
import Profile from "../pages/employee/Profile";
import Salary from "../pages/employee/Salary";
import MyTasks from "../pages/employee/MyTasks";

/* ================= ADMIN PAGES ================= */

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageEmployees from "../pages/admin/ManageEmployees";
import ReviewLeaves from "../pages/admin/ReviewLeaves";
import ManageHolidays from "../pages/admin/ManageHolidays";
import ManageTasks from "../pages/admin/ManageTasks";
import Holidays from "../pages/employee/Holidays";
import AuditLogs from "../pages/admin/AuditLogs";

const AppRoutes = () => {

  return (

    <Routes>

      {/* ===================================================== */}
      {/* ================= PUBLIC ROUTES ===================== */}
      {/* ===================================================== */}

      <Route element={<PublicLayout />}>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />

      </Route>


      {/* ===================================================== */}
      {/* =============== DASHBOARD ROUTES ==================== */}
      {/* ===================================================== */}

      <Route element={<DashboardLayout />}>

        {/* ---------------- COMMON (LOGIN REQUIRED) ---------------- */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* ---------------- EMPLOYEE ---------------- */}

        <Route
          path="/apply-leave"
          element={
            <ProtectedRoute role={["employee", "manager", "hr"]}>
              <ApplyLeave />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-leaves"
          element={
            <ProtectedRoute role={["employee", "manager", "hr"]}>
              <MyLeaves />
            </ProtectedRoute>
          }
        />

        <Route
          path="/salary"
          element={
            <ProtectedRoute role={["employee", "manager", "hr"]}>
              <Salary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute role={["employee", "manager", "hr"]}>
              <MyTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/holidays"
          element={
            <ProtectedRoute>
              <Holidays />
            </ProtectedRoute>
          }
        />


        {/* ---------------- ADMIN ---------------- */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-employees"
          element={
            <ProtectedRoute role="admin">
              <ManageEmployees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review-leaves"
          element={
            <ProtectedRoute role="admin">
              <ReviewLeaves />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-holidays"
          element={
            <ProtectedRoute role="admin">
              <ManageHolidays />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-tasks"
          element={
            <ProtectedRoute role="admin">
              <ManageTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute role="admin">
              <AuditLogs />
            </ProtectedRoute>
          }
        />

      </Route>

    </Routes>

  );

};

export default AppRoutes;