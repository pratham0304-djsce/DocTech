import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype:     { type: String },
  size:         { type: Number },
  reportType:   { type: String, enum: ['X-ray','MRI','CT Scan','Blood Test','Ultrasound','Other'], default: 'Other' },
  notes:        { type: String },
  aiAnalysis:   { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Report', reportSchema)
