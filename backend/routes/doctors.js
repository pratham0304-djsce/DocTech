import express from 'express'
import { getDoctors, getDoctor, getDoctorRecommendations, bookAppointment, getAppointments, updateAppointment } from '../controllers/doctorController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, getDoctors)
router.get('/recommendations', protect, getDoctorRecommendations)
router.get('/:id', protect, getDoctor)
router.post('/:id/appointments', protect, authorize('patient'), bookAppointment)
router.get('/appointments/all', protect, getAppointments)
router.put('/appointments/:id', protect, updateAppointment)

export default router
