import HealthMetric from '../models/HealthMetric.js'

// POST /api/metrics
export const addMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.create({ ...req.body, user: req.user._id })
    res.status(201).json(metric)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/metrics  (optional ?type=bmi)
export const getMetrics = async (req, res) => {
  try {
    const filter = { user: req.user._id }
    if (req.query.type) filter.type = req.query.type
    const metrics = await HealthMetric.find(filter).sort({ date: -1 })
    res.json(metrics)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// DELETE /api/metrics/:id
export const deleteMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findById(req.params.id)
    if (!metric) return res.status(404).json({ message: 'Metric not found' })
    if (metric.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    await metric.deleteOne()
    res.json({ message: 'Metric deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
