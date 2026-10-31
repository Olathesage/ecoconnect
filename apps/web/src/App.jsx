import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Report from './pages/Report'
import ReportConfirmation from './pages/ReportConfirmation'
import Track from './pages/Track'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminReportDetail from './pages/AdminReportDetail'
import NotFound from './pages/NotFound'

/**
 * EcoConnect Ekiti
 *
 * Application routes. Each page is built from the reusable design system
 * components (Button, TextInput, TextArea, StatusBadge, SeverityChip) and the
 * Figma design tokens configured in tailwind.config.js.
 */
function App() {
  return (
    <Routes>
      {/* Public user flows */}
      <Route path="/" element={<Landing />} />
      <Route path="/report" element={<Report />} />
      <Route path="/report/success" element={<ReportConfirmation />} />
      <Route path="/track" element={<Track />} />

      {/* Admin flows */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/reports/:id" element={<AdminReportDetail />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
