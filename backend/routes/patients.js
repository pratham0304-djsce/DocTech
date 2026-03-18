import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { getProfile, updateProfile, listPatients } from '../controllers/patientController.js'

const router = express.Router()

// All routes require login
router.use(protect)

router.get('/profile', authorize('patient'), getProfile)
router.put('/profile', authorize('patient'), updateProfile)
router.get('/',        authorize('doctor'),  listPatients)   // Doctor: list all patients

export default router
