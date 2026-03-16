import HealthRecord from '../models/HealthRecord.js'

// POST /api/health-records
export const createRecord = async (req, res) => {
  try {
    const record = await HealthRecord.create({ ...req.body, user: req.user._id })
    res.status(201).json(record)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/health-records
export const getRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.user._id }).sort({ date: -1 })
    res.json(records)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/health-records/:id
export const getRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
    if (!record) return res.status(404).json({ message: 'Record not found' })
    if (record.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    res.json(record)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// PUT /api/health-records/:id
export const updateRecord = async (req, res) => {
  try {
    let record = await HealthRecord.findById(req.params.id)
    if (!record) return res.status(404).json({ message: 'Record not found' })
    if (record.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.json(record)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// DELETE /api/health-records/:id
export const deleteRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
    if (!record) return res.status(404).json({ message: 'Record not found' })
    if (record.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    await record.deleteOne()
    res.json({ message: 'Record deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
