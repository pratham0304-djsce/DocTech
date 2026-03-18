import express from 'express'
import { protect } from '../middleware/auth.js'
import { chatWithAI, getChatHistory, analyzeSymptoms } from '../controllers/chatbotController.js'

const router = express.Router()
router.use(protect)

router.post('/chat',    chatWithAI)
router.post('/analyze', analyzeSymptoms)
router.get('/history',  getChatHistory)

export default router
