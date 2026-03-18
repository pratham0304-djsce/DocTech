import User from '../models/User.js'

// GET /api/patients/profile  — Get full patient profile (includes BMI virtual)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// PUT /api/patients/profile  — Update patient profile with auto-BMI
export const updateProfile = async (req, res) => {
  try {
    const allowed = [
      'name', 'age', 'gender', 'height', 'weight',
      'bloodGroup', 'allergies', 'chronicDiseases',
      'familyHistory', 'personalHistory', 'emergencyContact',
    ]
    const updates = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    })
    res.json({
      ...user.toObject(),
      bmi: user.bmi,
      bmiCategory: user.bmiCategory,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/patients  — Admin: list all patients (doctor role for now)
export const listPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password')
    res.json(patients)
  } catch (err) { res.status(500).json({ message: err.message }) }
}
