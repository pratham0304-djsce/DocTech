import express from 'express'
import { createRecord, getRecords, getRecord, updateRecord, deleteRecord } from '../controllers/healthRecordController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, createRecord)
router.get('/', protect, getRecords)
router.get('/:id', protect, getRecord)
router.put('/:id', protect, updateRecord)
router.delete('/:id', protect, deleteRecord)

export default router
