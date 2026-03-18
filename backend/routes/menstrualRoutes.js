import express from 'express'
import { saveMenstrualData, getMenstrualData } from '../controllers/menstrualController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .post(protect, saveMenstrualData)
  .get(protect, getMenstrualData)

export default router
