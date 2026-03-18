import MedicalRecord from '../models/MedicalRecord.js'
import cloudinary from '../config/cloudinary.js'

// POST /api/records/upload — upload a new medical record (with optional file)
export const uploadRecord = async (req, res) => {
  try {
    const { title, type, doctor, date, notes } = req.body

    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required.' })
    }

    const record = await MedicalRecord.create({
      patientId: req.user.id,
      title,
      type,
      doctor,
      date: date ? new Date(date) : new Date(),
      notes,
      fileUrl:  req.file?.path      || null,   // Cloudinary URL
      publicId: req.file?.filename  || null,   // Cloudinary public_id
    })

    res.status(201).json({ message: 'Record uploaded successfully', record })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/records — get all records for the logged-in patient
export const getRecords = async (req, res) => {
  try {
    const { type } = req.query
    const filter = { patientId: req.user.id }
    if (type && type !== 'all') filter.type = type

    const records = await MedicalRecord
      .find(filter)
      .sort({ date: -1 })

    res.status(200).json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/records/:id — get a single record
export const getRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)

    if (!record) return res.status(404).json({ message: 'Record not found.' })
    if (record.patientId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied.' })

    res.status(200).json(record)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/records/:id — delete record and remove from Cloudinary
export const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)

    if (!record) return res.status(404).json({ message: 'Record not found.' })
    if (record.patientId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied.' })

    // Remove file from Cloudinary if it exists
    if (record.publicId) {
      await cloudinary.uploader.destroy(record.publicId, { resource_type: 'auto' })
    }

    await record.deleteOne()
    res.status(200).json({ message: 'Record deleted successfully.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
