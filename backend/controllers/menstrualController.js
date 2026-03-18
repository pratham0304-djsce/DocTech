import MenstrualCycle from '../models/MenstrualCycle.js'

// POST /api/menstrual — create or update menstrual cycle data
export const updateMenstrualData = async (req, res) => {
  try {
    const { lastPeriodDate, cycleLength } = req.body

    if (!lastPeriodDate) {
      return res.status(400).json({ message: 'lastPeriodDate is required.' })
    }

    const data = await MenstrualCycle.findOneAndUpdate(
      { patientId: req.user.id },
      {
        patientId:      req.user.id,
        lastPeriodDate: new Date(lastPeriodDate),
        cycleLength:    cycleLength || 28,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({
      message: 'Cycle data saved.',
      data: {
        lastPeriodDate:  data.lastPeriodDate,
        cycleLength:     data.cycleLength,
        nextPeriodDate:  data.nextPeriodDate,
        ovulationDate:   data.ovulationDate,
        pmsStartDate:    data.pmsStartDate,
      },
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET /api/menstrual — get cycle predictions
export const getMenstrualData = async (req, res) => {
  try {
    const data = await MenstrualCycle.findOne({ patientId: req.user.id })

    if (!data) {
      return res.status(200).json({ message: 'No cycle data found.', data: null })
    }

    res.status(200).json({
      data: {
        lastPeriodDate: data.lastPeriodDate,
        cycleLength:    data.cycleLength,
        nextPeriodDate: data.nextPeriodDate,
        ovulationDate:  data.ovulationDate,
        pmsStartDate:   data.pmsStartDate,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
