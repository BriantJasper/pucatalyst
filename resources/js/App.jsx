import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Pages
import LandingPage from "./pages/LandingPageNew";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentOnboarding from "./pages/student/StudentOnboarding";
import RoadmapPage from "./pages/student/RoadmapPage";
import OrganizationExplorer from "./pages/student/OrganizationExplorer";
import CertificateExplorer from "./pages/student/CertificateExplorer";
import CourseExplorer from "./pages/student/CourseExplorer";
import SkillGapAnalysis from "./pages/student/SkillGapAnalysis";
import MentorMatch from "./pages/student/MentorMatch";
import ProfilePage from "./pages/ProfilePage";

// Alumni Pages
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniProfile from "./pages/alumni/AlumniProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageOrganizations from "./pages/admin/ManageOrganizations";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageCertificates from "./pages/admin/ManageCertificates";
import AlumniVerification from "./pages/admin/AlumniVerification";
import Analytics from "./pages/admin/Analytics";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route
                path="/student/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/onboarding"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentOnboarding />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/roadmap"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <RoadmapPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/organizations"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <OrganizationExplorer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/certificates"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <CertificateExplorer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/courses"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <CourseExplorer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/skill-gap"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <SkillGapAnalysis />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/mentors"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <MentorMatch />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/profile"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />

            {/* Alumni Routes */}
            <Route
                path="/alumni/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["alumni"]}>
                        <AlumniDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/alumni/profile"
                element={
                    <ProtectedRoute allowedRoles={["alumni"]}>
                        <AlumniProfile />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/organizations"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <ManageOrganizations />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/courses"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <ManageCourses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/certificates"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <ManageCertificates />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/verify-alumni"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AlumniVerification />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/analytics"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <Analytics />
                    </ProtectedRoute>
                }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
