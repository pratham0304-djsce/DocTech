import Report from '../models/Report.js'

// POST /api/reports/upload
export const uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' })
    const report = await Report.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      reportType: req.body.reportType || 'Other',
      notes: req.body.notes || '',
    })
    res.status(201).json(report)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/reports/:id
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })
    if (report.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    res.json(report)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// DELETE /api/reports/:id
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })
    if (report.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    await report.deleteOne()
    res.json({ message: 'Report deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
