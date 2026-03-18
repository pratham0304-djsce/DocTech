import HealthMetric from '../models/HealthMetric.js'
import Reminder from '../models/Reminder.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcBMI = (weight, height) => {
  if (!weight || !height) return null
  const h = height / 100 // cm → m
  return parseFloat((weight / (h * h)).toFixed(1))
}

const generateInsights = (metrics) => {
  const insights = []
  const latest = metrics[0]
  if (!latest) return ['Log your first health metric to get AI insights.']

  // BMI insight
  if (latest.BMI) {
    if (latest.BMI < 18.5) insights.push('Your BMI is below normal. Consider increasing your nutrient intake.')
    else if (latest.BMI >= 25 && latest.BMI < 30) insights.push('Your BMI is slightly high. Light exercise may help.')
    else if (latest.BMI >= 30) insights.push('Your BMI is in the obese range. Consult a healthcare professional.')
  }

  // BP insight
  if (latest.bloodPressure) {
    const parts = latest.bloodPressure.split('/')
    const sys = parseInt(parts[0])
    const dia = parseInt(parts[1])
    if (!isNaN(sys) && !isNaN(dia)) {
      if (sys > 140 || dia > 90) insights.push('Blood pressure readings are above normal. Monitor closely.')
      else if (sys < 90) insights.push('Blood pressure appears low. Stay hydrated.')
    }
  }

  // Weight trend insight (compare first vs last if ≥2 entries)
  if (metrics.length >= 2) {
    const oldest = metrics[metrics.length - 1]
    if (latest.weight && oldest.weight) {
      const diff = parseFloat((latest.weight - oldest.weight).toFixed(1))
      if (diff > 2) insights.push(`Weight increased by ${diff}kg recently. Keep track of your diet.`)
      else if (diff < -2) insights.push(`Weight decreased by ${Math.abs(diff)}kg recently. Great progress!`)
    }
  }

  // Fallback
  if (insights.length === 0) insights.push('Your health metrics look stable. Keep it up!')

  return insights.slice(0, 2)
}

const groupByPeriod = (metrics, period) => {
  const grouped = {}

  metrics.forEach((m) => {
    const d = new Date(m.date)
    let key

    if (period === 'monthly') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    } else {
      // weekly — ISO week
      const day = d.getDay() || 7
      const monday = new Date(d)
      monday.setDate(d.getDate() - day + 1)
      key = monday.toISOString().split('T')[0]
    }

    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, entries]) => ({
      label,
      avgWeight: entries.some(e => e.weight)
        ? parseFloat((entries.reduce((s, e) => s + (e.weight || 0), 0) / entries.filter(e => e.weight).length).toFixed(1))
        : null,
      avgBMI: entries.some(e => e.BMI)
        ? parseFloat((entries.reduce((s, e) => s + (e.BMI || 0), 0) / entries.filter(e => e.BMI).length).toFixed(1))
        : null,
      latestBP: entries.find(e => e.bloodPressure)?.bloodPressure || null,
    }))
}

// ─── Auto-create reminders ─────────────────────────────────────────────────────

const autoCreateReminders = async (userId, metric) => {
  // Weekly weight reminder — create only if none exists
  const existingWeight = await Reminder.findOne({ userId, type: 'weight' })
  if (!existingWeight) {
    await Reminder.create({
      userId,
      type: 'weight',
      message: 'Log your weight this week to track your progress.',
      status: 'pending',
    })
  }

  // BP reminder — create/reset when systolic > 140
  if (metric.bloodPressure) {
    const sys = parseInt(metric.bloodPressure.split('/')[0])
    if (!isNaN(sys) && sys > 140) {
      const existingBP = await Reminder.findOne({ userId, type: 'BP' })
      if (!existingBP) {
        await Reminder.create({
          userId,
          type: 'BP',
          message: 'Check your blood pressure — previous reading was elevated.',
          status: 'pending',
        })
      }
    }
  }
}

// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /api/health
export const logMetric = async (req, res) => {
  try {
    const { weight, height, bloodPressure, bloodSugar } = req.body
    const userId = req.user._id

    const BMI = calcBMI(weight, height)

    const metric = await HealthMetric.create({
      userId,
      weight,
      height,
      BMI,
      bloodPressure,
      bloodSugar,
    })

    await autoCreateReminders(userId, metric)

    res.status(201).json({ success: true, metric })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/health?period=weekly|monthly
export const getMetrics = async (req, res) => {
  try {
    const userId = req.user._id
    const { period = 'weekly' } = req.query

    const metrics = await HealthMetric.find({ userId }).sort({ date: -1 }).limit(90)

    const trends = groupByPeriod(metrics, period)
    const insights = generateInsights(metrics)
    const latest = metrics[0] || null

    res.json({ success: true, latest, trends, insights })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
