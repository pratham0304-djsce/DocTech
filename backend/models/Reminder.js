import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true, trim: true },
  type:      { type: String, enum: ['medication','appointment','followup','exercise','other'], default: 'other' },
  datetime:  { type: Date, required: true },
  recurring: { type: Boolean, default: false },
  frequency: { type: String, enum: ['daily','weekly','monthly', null], default: null },
  isActive:  { type: Boolean, default: true },
  notes:     { type: String },
}, { timestamps: true })

export default mongoose.model('Reminder', reminderSchema)
