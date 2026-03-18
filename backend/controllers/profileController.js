import PatientProfile from '../models/PatientProfile.js'

// GET /api/profile — get own profile (or create if not exists)
export const getProfile = async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user.id })
    if (!profile) {
      // Return empty profile structure so frontend knows what fields exist
      return res.status(200).json({
        userId: req.user.id,
        name: req.user.name || '',
        age: null, gender: null, height: null, weight: null,
        bloodGroup: 'Unknown',
        allergies: [], chronicDiseases: [], familyHistory: [], personalHistory: '',
        bmi: null,
      })
    }
    res.status(200).json(profile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/profile — create or update profile
export const updateProfile = async (req, res) => {
  try {
    const {
      name, age, gender, height, weight,
      bloodGroup, allergies, chronicDiseases, familyHistory, personalHistory,
    } = req.body

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        name, age, gender, height, weight,
        bloodGroup, allergies, chronicDiseases, familyHistory, personalHistory,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({ message: 'Profile updated successfully', profile })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
