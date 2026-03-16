import express from 'express'
import { addMetric, getMetrics, deleteMetric } from '../controllers/metricController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, addMetric)
router.get('/', protect, getMetrics)
router.delete('/:id', protect, deleteMetric)

export default router
