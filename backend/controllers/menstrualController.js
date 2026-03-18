import MenstrualCycle from '../models/MenstrualCycle.js'

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const getCyclePhase = (lastPeriodDate, cycleLength) => {
  const today = new Date()
  const daysSince = Math.floor((today - new Date(lastPeriodDate)) / (1000 * 60 * 60 * 24))
  const dayInCycle = ((daysSince % cycleLength) + cycleLength) % cycleLength

  if (dayInCycle <= 5)                          return 'Menstrual'
  if (dayInCycle <= 13)                         return 'Follicular'
  if (dayInCycle >= 14 && dayInCycle <= 16)     return 'Ovulation'
  return 'Luteal'
}

// POST /api/menstrual — create or update (1 record per user)
export const saveMenstrualData = async (req, res) => {
  try {
    const { lastPeriodDate, cycleLength } = req.body
    if (!lastPeriodDate) return res.status(400).json({ message: 'lastPeriodDate is required' })

    const cycle = parseInt(cycleLength) || 28

    const record = await MenstrualCycle.findOneAndUpdate(
      { userId: req.user._id },
      { lastPeriodDate, cycleLength: cycle },
      { new: true, upsert: true }
    )

    const nextPeriodDate = addDays(lastPeriodDate, cycle)
    const currentPhase   = getCyclePhase(lastPeriodDate, cycle)

    res.status(200).json({ success: true, record, nextPeriodDate, currentPhase })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/menstrual
export const getMenstrualData = async (req, res) => {
  try {
    const record = await MenstrualCycle.findOne({ userId: req.user._id })
    if (!record) return res.json({ success: true, record: null, nextPeriodDate: null, currentPhase: null })

    const nextPeriodDate = addDays(record.lastPeriodDate, record.cycleLength)
    const currentPhase   = getCyclePhase(record.lastPeriodDate, record.cycleLength)

    res.json({ success: true, record, nextPeriodDate, currentPhase })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
