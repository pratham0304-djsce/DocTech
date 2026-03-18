import Reminder from '../models/Reminder.js'

// POST /api/reminders/ehr — create a new EHR-specific reminder
export const createEhrReminder = async (req, res) => {
  try {
    const { title, type, datetime, notes } = req.body

    if (!title || !datetime) {
      return res.status(400).json({ message: 'Title and datetime are required.' })
    }

    const reminder = await Reminder.create({
      user:     req.user.id,
      title,
      type:     type || 'other',
      datetime: new Date(datetime),
      notes,
    })

    res.status(201).json({ message: 'Reminder created.', reminder })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET /api/reminders/ehr — get all reminders for this patient
export const getEhrReminders = async (req, res) => {
  try {
    const reminders = await Reminder
      .find({ user: req.user.id })
      .sort({ datetime: 1 })

    res.status(200).json(reminders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/reminders/ehr/:id — delete a reminder
export const deleteEhrReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)

    if (!reminder) return res.status(404).json({ message: 'Reminder not found.' })
    if (reminder.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied.' })

    await reminder.deleteOne()
    res.status(200).json({ message: 'Reminder deleted.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
