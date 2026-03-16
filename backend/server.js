import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'

import authRoutes         from './routes/auth.js'
import symptomRoutes      from './routes/symptoms.js'
import reportRoutes       from './routes/reports.js'
import healthRecordRoutes from './routes/healthRecords.js'
import doctorRoutes       from './routes/doctors.js'
import metricRoutes       from './routes/metrics.js'
import reminderRoutes     from './routes/reminders.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads')) // Serve uploaded files

// Routes
app.use('/api/auth',           authRoutes)
app.use('/api/symptoms',       symptomRoutes)
app.use('/api/reports',        reportRoutes)
app.use('/api/health-records', healthRecordRoutes)
app.use('/api/doctors',        doctorRoutes)
app.use('/api/metrics',        metricRoutes)
app.use('/api/reminders',      reminderRoutes)

// Health check
app.get('/', (req, res) => res.json({ message: 'DocTech API is running ✅', version: '1.0.0' }))

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({ message: err.message })
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 DocTech API running on port ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Is another backend instance running?`)
    console.error(`   Run: taskkill /IM node.exe /F   (Windows) to kill all Node processes, then retry.`)
  } else {
    console.error('Server error:', err)
  }
  process.exit(1)
})
