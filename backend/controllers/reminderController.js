import Reminder from '../models/Reminder.js'

// POST /api/reminders
export const createReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create({ ...req.body, user: req.user._id })
    res.status(201).json(reminder)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id, isActive: true }).sort({ datetime: 1 })
    res.json(reminders)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// PUT /api/reminders/:id
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' })
    if (reminder.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// DELETE /api/reminders/:id
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' })
    if (reminder.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' })
    await reminder.deleteOne()
    res.json({ message: 'Reminder deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
