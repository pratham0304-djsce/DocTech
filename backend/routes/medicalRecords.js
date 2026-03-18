import express from 'express'
import {
  uploadRecord, getRecords, getRecordById, deleteRecord,
} from '../controllers/medicalRecordController.js'
import { protect } from '../middleware/auth.js'
import uploadCloudinary from '../middleware/uploadCloudinary.js'

const router = express.Router()

// POST /api/records/upload — multipart form with optional file
router.post('/upload', protect, uploadCloudinary.single('file'), uploadRecord)
// GET  /api/records — list all, optional ?type= filter
router.get('/',        protect, getRecords)
// GET  /api/records/:id
router.get('/:id',     protect, getRecordById)
// DELETE /api/records/:id
router.delete('/:id',  protect, deleteRecord)

export default router
