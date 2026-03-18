import express from 'express'
import { updateMenstrualData, getMenstrualData } from '../controllers/menstrualController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, updateMenstrualData)
router.get('/',  protect, getMenstrualData)

export default router
