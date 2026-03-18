import mongoose from 'mongoose'

const menstrualCycleSchema = new mongoose.Schema({
  patientId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lastPeriodDate:  { type: Date, required: true },
  cycleLength:     { type: Number, default: 28, min: 20, max: 45 }, // days
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
})

// Virtual: next period date
menstrualCycleSchema.virtual('nextPeriodDate').get(function () {
  if (!this.lastPeriodDate || !this.cycleLength) return null
  const d = new Date(this.lastPeriodDate)
  d.setDate(d.getDate() + this.cycleLength)
  return d
})

// Virtual: ovulation date (cycleLength − 14 days after last period)
menstrualCycleSchema.virtual('ovulationDate').get(function () {
  if (!this.lastPeriodDate || !this.cycleLength) return null
  const d = new Date(this.lastPeriodDate)
  d.setDate(d.getDate() + (this.cycleLength - 14))
  return d
})

// Virtual: PMS start (5 days before next period)
menstrualCycleSchema.virtual('pmsStartDate').get(function () {
  if (!this.lastPeriodDate || !this.cycleLength) return null
  const d = new Date(this.lastPeriodDate)
  d.setDate(d.getDate() + (this.cycleLength - 5))
  return d
})

export default mongoose.model('MenstrualCycle', menstrualCycleSchema)
