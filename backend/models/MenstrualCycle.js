import mongoose from 'mongoose'

const menstrualCycleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one record per user, updated on each save
    },
    lastPeriodDate: { type: Date, required: true },
    cycleLength:    { type: Number, default: 28 }, // days
  },
  { timestamps: true }
)

export default mongoose.model('MenstrualCycle', menstrualCycleSchema)
