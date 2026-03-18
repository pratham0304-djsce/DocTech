import Appointment from '../models/Appointment.js'
import User from '../models/User.js'

// POST /api/appointments  — Book appointment for a patient with a doctor
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, datetime, reason } = req.body
    if (!doctorId || !datetime) return res.status(400).json({ message: 'doctorId and datetime are required' })
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' })
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })

    const exists = await Appointment.findOne({ doctor: doctorId, datetime, status: { $in: ['pending', 'confirmed'] } })
    if (exists) return res.status(409).json({ message: 'This slot is already booked. Please choose a different time.' })

    const appt = await Appointment.create({
      patient:  req.user._id,
      doctor:   doctorId,
      datetime, reason,
    })
    const populated = await appt.populate([
      { path: 'doctor',  select: 'name department hospital location' },
      { path: 'patient', select: 'name email' },
    ])
    res.status(201).json(populated)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/appointments  — Role-based: patient sees own, doctor sees theirs
export const getAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'patient'
      ? { patient: req.user._id }
      : { doctor:  req.user._id }

    const { status, from, to } = req.query
    if (status) filter.status = status
    if (from || to) {
      filter.datetime = {}
      if (from) filter.datetime.$gte = new Date(from)
      if (to)   filter.datetime.$lte = new Date(to)
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email age gender')
      .populate('doctor',  'name department hospital location')
      .sort({ datetime: 1 })
    res.json(appointments)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/appointments/:id  — Get single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor',  'name department hospital')
    if (!appt) return res.status(404).json({ message: 'Appointment not found' })
    res.json(appt)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// PUT /api/appointments/:id  — Update status or notes (doctor only)
export const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
    if (!appt) return res.status(404).json({ message: 'Appointment not found' })
    const allowed = ['status', 'notes', 'meetingLink']
    const updates = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })
    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
    res.json(updated)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// DELETE /api/appointments/:id  — Patient can cancel their own appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
    if (!appt) return res.status(404).json({ message: 'Appointment not found' })
    if (appt.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' })
    }
    appt.status = 'cancelled'
    await appt.save()
    res.json({ message: 'Appointment cancelled', appointment: appt })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
