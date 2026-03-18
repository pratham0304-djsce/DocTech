import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type:    { type: String, enum: ['weight', 'BP', 'bloodSugar', 'general'], default: 'general' },
    message: { type: String, required: true },
    date:    { type: Date, default: Date.now },
    status:  { type: String, enum: ['pending', 'completed'], default: 'pending' },
  },
  { timestamps: true }
)

export default mongoose.model('Reminder', reminderSchema)
