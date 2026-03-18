import express from 'express'
import { createReminder, getReminders, updateReminder } from '../controllers/reminderController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .post(protect, createReminder)
  .get(protect, getReminders)

router.route('/:id')
  .put(protect, updateReminder)

export default router
