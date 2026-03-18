import express from 'express'
import { logMetric, getMetrics } from '../controllers/healthController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .post(protect, logMetric)
  .get(protect, getMetrics)

export default router
