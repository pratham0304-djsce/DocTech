import mongoose from 'mongoose'

const healthMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weight: { type: Number }, // kg
    height: { type: Number }, // cm
    BMI:    { type: Number },
    bloodPressure: { type: String }, // e.g. "120/80"
    bloodSugar:    { type: Number }, // mg/dL
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('HealthMetric', healthMetricSchema)
