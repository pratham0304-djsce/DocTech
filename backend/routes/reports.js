import express from 'express'
import { uploadReport, getReports, getReport, deleteReport } from '../controllers/reportController.js'
import { protect } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post('/upload', protect, upload.single('report'), uploadReport)
router.get('/', protect, getReports)
router.get('/:id', protect, getReport)
router.delete('/:id', protect, deleteReport)

export default router
