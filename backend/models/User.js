import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['patient', 'doctor'], default: 'patient' },
  // Patient
  age:       { type: Number },
  gender:    {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'],
    set: (v) => v?.toLowerCase(),    // normalise "Male" → "male" before validation
  },
  height:    { type: Number },  // cm
  weight:    { type: Number },  // kg
  // Doctor
  department:  { type: String },
  experience:  { type: Number },
  hospital:    { type: String },
  location:    { type: String },
  isVerified:  { type: Boolean, default: false },
  rating:      { type: Number, default: 0 },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

export default mongoose.model('User', userSchema)
