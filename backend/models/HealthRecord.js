import mongoose from 'mongoose'

const healthRecordSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  date:        { type: Date, default: Date.now },
  recordType:  { type: String, enum: ['diagnosis','prescription','lab-result','vaccination','surgery','other'], default: 'other' },
  attachments: [{ type: String }],
  tags:        [{ type: String }],
  doctor:      { type: String },
}, { timestamps: true })

export default mongoose.model('HealthRecord', healthRecordSchema)
