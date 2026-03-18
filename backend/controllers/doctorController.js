import User from '../models/User.js'
import Appointment from '../models/Appointment.js'

// GET /api/doctors
export const getDoctors = async (req, res) => {
  try {
    const { department, location, experience, rating } = req.query
    const filter = { role: 'doctor' }
    
    if (department) filter.department = { $regex: department, $options: 'i' }
    if (location)   filter.location   = { $regex: location,   $options: 'i' }
    if (experience) filter.experience = { $gte: Number(experience) }
    if (rating)     filter.rating     = { $gte: Number(rating) }
    
    // We assume availability could be handled natively or mocked for now
    const doctors = await User.find(filter).select('-password')
    res.json(doctors)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/doctors/recommendations?symptoms=headache,fever
export const getDoctorRecommendations = async (req, res) => {
  try {
    const { symptoms } = req.query
    // Map symptom keywords to departments
    const SYMPTOM_DEPT = {
      chest_pain: 'Cardiology', breathlessness: 'Cardiology', heart: 'Cardiology',
      headache: 'Neurology', dizziness: 'Neurology', seizure: 'Neurology',
      joint_pain: 'Orthopedics', back_pain: 'Orthopedics', bone: 'Orthopedics',
      rash: 'Dermatology', skin: 'Dermatology',
      pregnancy: 'Gynecology', menstrual: 'Gynecology', women: 'Gynecology',
      child: 'Pediatrics', fever: 'General Medicine',
    }
    const symptomList = symptoms ? symptoms.split(',') : []
    const departments = [...new Set(symptomList.map(s => SYMPTOM_DEPT[s.toLowerCase().trim()] || 'General Medicine'))]
    const doctors = await User.find({ role: 'doctor', department: { $in: departments } }).select('-password')
    res.json({ departments, doctors })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/doctors/:id
export const getDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password')
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })
    res.json(doctor)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// POST /api/doctors/:id/appointments
export const bookAppointment = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor:  req.params.id,
      datetime: req.body.datetime,
      reason:   req.body.reason,
      hopi:     req.body.hopi || null // Save the AI-generated History of Presenting Illness
    })
    res.status(201).json(appointment)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/appointments
export const getAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'patient' ? { patient: req.user._id } : { doctor: req.user._id }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name department hospital')
      .sort({ datetime: 1 })
    res.json(appointments)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// PUT /api/appointments/:id
export const updateAppointment = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id)
    if (!apt) return res.status(404).json({ message: 'Appointment not found' })
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) { res.status(500).json({ message: err.message }) }
}
