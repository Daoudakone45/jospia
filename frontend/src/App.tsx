import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ContactPage from './pages/ContactPage'
import InscriptionPage from './pages/InscriptionPage'
import PaymentPage from './pages/PaymentPage'
import ReceiptPage from './pages/ReceiptPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminInscriptions from './pages/admin/AdminInscriptions'
import AdminPayments from './pages/admin/AdminPayments'
import AdminDormitories from './pages/admin/AdminDormitories'
import AdminAssignments from './pages/admin/AdminAssignments'
import AdminStats from './pages/admin/AdminStats'
import AdminCashPayments from './pages/admin/AdminCashPayments'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  const { initialize, isLoading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected routes */}
          <Route
            path="/inscription"
            element={
              <ProtectedRoute>
                <InscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:inscriptionId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipt/:paymentId"
            element={
              <ProtectedRoute>
                <ReceiptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/inscriptions"
            element={
              <AdminRoute>
                <AdminInscriptions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminRoute>
                <AdminPayments />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/cash-payments"
            element={
              <AdminRoute>
                <AdminCashPayments />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dormitories"
            element={
              <AdminRoute>
                <AdminDormitories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <AdminRoute>
                <AdminAssignments />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <AdminRoute>
                <AdminStats />
              </AdminRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<div className="container mx-auto px-4 py-20 text-center"><h1>Page non trouvée</h1></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
