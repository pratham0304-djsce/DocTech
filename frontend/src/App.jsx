import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import DashboardLayout from './layout/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PatientDashboard from './pages/PatientDashboard'

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
          <Route path="login"  element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Patient dashboard routes */}
        <Route path="/patient" element={<DashboardLayout />}>
          <Route path="dashboard"    element={<PatientDashboard />} />
          <Route path="ai-bot"       element={<Placeholder title="AI Health Assistant" />} />
          <Route path="records"      element={<Placeholder title="Medical Records" />} />
          <Route path="appointments" element={<Placeholder title="Appointments" />} />
          <Route path="tracker"      element={<Placeholder title="Health Tracker" />} />
          <Route path="reminders"    element={<Placeholder title="Reminders" />} />
          <Route path="profile"      element={<Placeholder title="Profile" />} />
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
