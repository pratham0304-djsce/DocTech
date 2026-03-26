import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
  sender:    { type: String, enum: ['user', 'ai'], required: true },
  message:   { type: String, default: '' },
  file:      {
    name: String,
    size: Number,
    type: String,
  },
  metadata:  {            // Standardized response metadata (from Response Formatter)
    conditions:  [{ name: String, probability: String, description: String, confidence: String }],
    severity:    String,
    department:  [String],
    urgency:     String,
    explanation: String,
    followUp:    [String],
  },
}, { timestamps: true })

chatMessageSchema.index({ sessionId: 1, createdAt: 1 })

export default mongoose.model('ChatMessage', chatMessageSchema)
