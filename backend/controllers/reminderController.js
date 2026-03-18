import Reminder from '../models/Reminder.js'

// POST /api/reminders
export const createReminder = async (req, res) => {
  try {
    const { type, message, date } = req.body
    const reminder = await Reminder.create({
      userId: req.user._id,
      type:    type    || 'general',
      message: message || 'Health reminder',
      date:    date    || new Date(),
      status:  'pending',
    })
    res.status(201).json({ success: true, reminder })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ date: -1 })
    res.json({ success: true, reminders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/reminders/:id — toggle status or update fields
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id })
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' })

    const { status, message, date } = req.body
    if (status)  reminder.status  = status
    if (message) reminder.message = message
    if (date)    reminder.date    = date

    await reminder.save()
    res.json({ success: true, reminder })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
