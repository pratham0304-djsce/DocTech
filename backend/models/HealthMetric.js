import mongoose from 'mongoose'

const healthMetricSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:  { type: String, enum: ['bmi','weight','height','blood_pressure','glucose','heart_rate','menstrual','steps','sleep'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit:  { type: String },
  date:  { type: Date, default: Date.now },
  notes: { type: String },
}, { timestamps: true })

export default mongoose.model('HealthMetric', healthMetricSchema)
