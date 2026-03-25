import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";
import Layout from "./components/layout/Layout";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientMyCases from "./pages/patient/PatientMyCases";
import SubmitCase from "./pages/patient/SubmitCase";
import PatientCaseDetails from "./pages/patient/PatientCaseDetails";
import PatientReportPage from "./pages/patient/PatientReportPage";
import TestSelectionPage from "./pages/patient/TestSelectionPage";
import TextUploadPage from "./pages/patient/TextUploadPage";
import CognitiveTestPage from "./pages/patient/CognitiveTestPage";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientReports from "./pages/patient/PatientReports";
import PatientProfile from "./pages/patient/PatientProfile";
import BookAppointmentPage from "./pages/patient/BookAppointmentPage";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorCaseDetails from "./pages/doctor/DoctorCaseDetails";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorCaseReview from "./pages/doctor/DoctorCaseReview";
import DoctorAIResult from "./pages/doctor/DoctorAIResult";
import DoctorCaseHistory from "./pages/doctor/DoctorCaseHistory";
import DoctorCognitiveDetails from "./pages/doctor/DoctorCognitiveDetails";
import DoctorBookings from "./pages/doctor/DoctorBookings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCaseDetails from "./pages/admin/AdminCaseDetails";

import { Toaster } from "react-hot-toast";


function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <PatientDashboard />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/my-cases"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <PatientMyCases />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/submit"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <SubmitCase />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/case/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <PatientCaseDetails />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/case/:id/report"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <PatientReportPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/case/:id/select-test"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <TestSelectionPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/case/:id/upload"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <TextUploadPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/case/:id/cognitive-test"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <CognitiveTestPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/history"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <PatientHistory />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <PatientReports />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <PatientProfile />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/book-appointment/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="patient">
                  <Layout>
                    <BookAppointmentPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorDashboard />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/case/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorCaseDetails />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorProfile />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
           <Route
            path="/doctor/history"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorCaseHistory />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/case/:id/review"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorCaseReview />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/case/:id/result"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorAIResult />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
           <Route
            path="/doctor/case/:id/cognitive-details"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorCognitiveDetails />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
           <Route
            path="/doctor/bookings"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="doctor">
                  <Layout>
                    <DoctorBookings />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/case/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <Layout>
                    <AdminCaseDetails />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />


        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;