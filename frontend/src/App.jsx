import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import DashboardLayout from './layout/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PatientDashboard from './pages/PatientDashboard'
import AIChatbot from './pages/AIChatbot'
import DoctorFinder from './pages/DoctorFinder'
import Appointments from './pages/Appointments'
import PatientProfilePage from './pages/PatientProfilePage'

// Placeholder pages for sub-routes
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-2xl font-bold text-primary-600">{title}</p>
      <p className="text-gray-500 mt-2">Coming soon…</p>
    </div>
  </div>
)

// ── Inner component so useLocation works inside BrowserRouter ──
function AnimatedRoutes() {
  const location = useLocation()

  return (
    // key changes on every route → triggers page-enter CSS animation universally
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        {/* Public routes with Navbar + Footer */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Patient dashboard routes */}
        <Route path="/patient" element={<DashboardLayout />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="ai-bot" element={<AIChatbot />} />
          <Route path="doctor-finder" element={<DoctorFinder />} />
          <Route path="records" element={<Placeholder title="Medical Records" />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="tracker" element={<Placeholder title="Health Tracker" />} />
          <Route path="profile" element={<PatientProfilePage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
