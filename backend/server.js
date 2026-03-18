import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'

import authRoutes         from './routes/auth.js'
import symptomRoutes      from './routes/symptoms.js'
import reportRoutes       from './routes/reports.js'
import healthRecordRoutes from './routes/healthRecords.js'
import doctorRoutes       from './routes/doctors.js'
import patientRoutes       from './routes/patients.js'
import appointmentRoutes   from './routes/appointments.js'
import chatbotRoutes       from './routes/chatbot.js'
import profileRoutes       from './routes/profile.js'
import medicalRecordRoutes from './routes/medicalRecords.js'
import healthRoutes        from './routes/healthRoutes.js'
import reminderRoutes      from './routes/reminderRoutes.js'
import menstrualRoutes     from './routes/menstrualRoutes.js'

dotenv.config()
connectDB()

const app = express()

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes)
app.use('/api/patients',       patientRoutes)
app.use('/api/appointments',   appointmentRoutes)
app.use('/api/chatbot',        chatbotRoutes)
app.use('/api/symptoms',       symptomRoutes)
app.use('/api/reports',        reportRoutes)
app.use('/api/health-records', healthRecordRoutes)
app.use('/api/doctors',        doctorRoutes)
app.use('/api/health',         healthRoutes)
app.use('/api/reminders',      reminderRoutes)
app.use('/api/profile',        profileRoutes)
app.use('/api/records',        medicalRecordRoutes)
app.use('/api/menstrual',      menstrualRoutes)

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  message: 'DocTech API is running ✅',
  version: '2.0.0',
  endpoints: [
    '/api/auth', '/api/patients', '/api/appointments', '/api/chatbot',
    '/api/reports', '/api/health-records', '/api/doctors',
    '/api/health', '/api/reminders', '/api/menstrual',
    '/api/symptoms', '/api/profile', '/api/records',
  ],
}))

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({ message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined })
})

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5001

const server = app.listen(PORT, () => {
  console.log(`🚀 DocTech API running on port ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`)
    console.error(`   Run: taskkill /IM node.exe /F   (Windows) to kill all Node processes.`)
  } else {
    console.error('Server error:', err)
  }
  process.exit(1)
})
