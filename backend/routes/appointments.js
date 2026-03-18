import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  bookAppointment, getAppointments, getAppointmentById,
  updateAppointment, cancelAppointment,
} from '../controllers/appointmentController.js'

const router = express.Router()
router.use(protect)

router.post('/',       bookAppointment)
router.get('/',        getAppointments)
router.get('/:id',     getAppointmentById)
router.put('/:id',     updateAppointment)
router.delete('/:id',  cancelAppointment)

export default router
