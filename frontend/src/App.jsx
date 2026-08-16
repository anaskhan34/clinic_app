import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import UnauthorizedPage from "./pages/public/UnauthorizedPage";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import ClinicsPage from "./pages/patient/ClinicsPage";
import DoctorsPage from "./pages/patient/DoctorsPage";
import BookAppointmentPage from "./pages/patient/BookAppointmentPage";
import MyAppointmentsPage from "./pages/patient/MyAppointmentsPage";
import AppointmentDetailsPage from "./pages/patient/AppointmentDetailsPage";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfilePage from "./pages/doctor/DoctorProfilePage";
import DoctorSchedulePage from "./pages/doctor/DoctorSchedulePage";
import DoctorQueuePage from "./pages/doctor/DoctorQueuePage";

// Clinic Admin Pages
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import ClinicProfilePage from "./pages/clinic/ClinicProfilePage";
import ClinicDoctorsPage from "./pages/clinic/ClinicDoctorsPage";
import ClinicAppointmentsPage from "./pages/clinic/ClinicAppointmentsPage";

// Super Admin Pages
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import SuperAdminClinicsPage from "./pages/admin/SuperAdminClinicsPage";
import SuperAdminDoctorsPage from "./pages/admin/SuperAdminDoctorsPage";
import SuperAdminAppointmentsPage from "./pages/admin/SuperAdminAppointmentsPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking your session..." />;
  }

  // Helper component to redirect/render correct dashboard
  const DashboardRedirect = () => {
    switch (user?.role) {
      case "PATIENT":
        return <PatientDashboard />;
      case "DOCTOR":
        return <DoctorDashboard />;
      case "CLINIC_ADMIN":
        return <ClinicDashboard />;
      case "SUPER_ADMIN":
        return <SuperAdminDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  const showSidebar = user && user.role !== "PATIENT";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        {showSidebar && <Sidebar />}
        <main className="flex-1 min-w-0">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Common Dashboard landing */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/clinics"
              element={
                <ProtectedRoute allowedRoles={["PATIENT", "SUPER_ADMIN"]}>
                  <ClinicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <ProtectedRoute allowedRoles={["PATIENT", "SUPER_ADMIN"]}>
                  <DoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute allowedRoles={["PATIENT"]}>
                  <BookAppointmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={["PATIENT"]}>
                  <MyAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id"
              element={
                <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"]}>
                  <AppointmentDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/profile"
              element={
                <ProtectedRoute allowedRoles={["DOCTOR"]}>
                  <DoctorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/schedule"
              element={
                <ProtectedRoute allowedRoles={["DOCTOR"]}>
                  <DoctorSchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/queue"
              element={
                <ProtectedRoute allowedRoles={["DOCTOR"]}>
                  <DoctorQueuePage />
                </ProtectedRoute>
              }
            />

            {/* Clinic Admin Routes */}
            <Route
              path="/clinic/profile"
              element={
                <ProtectedRoute allowedRoles={["CLINIC_ADMIN"]}>
                  <ClinicProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinic/doctors"
              element={
                <ProtectedRoute allowedRoles={["CLINIC_ADMIN"]}>
                  <ClinicDoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinic/appointments"
              element={
                <ProtectedRoute allowedRoles={["CLINIC_ADMIN"]}>
                  <ClinicAppointmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/admin/clinics"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <SuperAdminClinicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <SuperAdminDoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <SuperAdminAppointmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
