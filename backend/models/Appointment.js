import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  datetime:    { type: Date, required: true },
  status:      { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  reason:      { type: String },
  hopi:        { type: String }, // History of Presenting Illness from AI Triage
  notes:       { type: String },
  meetingLink: { type: String },
}, { timestamps: true })

export default mongoose.model('Appointment', appointmentSchema)
