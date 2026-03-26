import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  createSession, getSessions, getMessages,
  sendMessage, deleteSession,
} from '../controllers/chatController.js'

const router = Router()

router.use(protect) // All endpoints require JWT

router.post('/session',             createSession)
router.get('/sessions',             getSessions)
router.get('/messages/:sessionId',  getMessages)
router.post('/message',             sendMessage)
router.delete('/session/:id',       deleteSession)

export default router
