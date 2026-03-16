import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, height, weight, department, experience, hospital, location } = req.body
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' })
    const user = await User.create({
      name, email, password, role,
      ...(role === 'patient' && { age, gender, height, weight }),
      ...(role === 'doctor'  && { department, experience, hospital, location }),
    })
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: genToken(user._id) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' })
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: genToken(user._id) })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/auth/me
export const getMe = async (req, res) => res.json(req.user)

// PUT /api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const fields = ['name','age','gender','height','weight','department','experience','hospital','location']
    const updates = {}
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json(user)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' })
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password updated successfully' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
