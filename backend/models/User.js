import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['patient', 'doctor'], default: 'patient' },

  // ── Patient fields ────────────────────────────────────────────
  age:                { type: Number },
  gender:             { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'], set: v => v?.toLowerCase() },
  height:             { type: Number },   // cm
  weight:             { type: Number },   // kg
  bloodGroup:         { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'], default: 'Unknown' },
  allergies:          [{ type: String }],
  chronicDiseases:    [{ type: String }],
  familyHistory:      { type: String },
  personalHistory:    { type: String },
  emergencyContact:   {
    name:  { type: String },
    phone: { type: String },
    relation: { type: String },
  },

  // ── Doctor fields ─────────────────────────────────────────────
  department:  { type: String },
  experience:  { type: Number },
  hospital:    { type: String },
  location:    { type: String },
  isVerified:  { type: Boolean, default: false },
  rating:      { type: Number, default: 0 },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// ── Auto-calculate BMI ────────────────────────────────────────
userSchema.virtual('bmi').get(function () {
  if (!this.height || !this.weight) return null
  return parseFloat((this.weight / ((this.height / 100) ** 2)).toFixed(1))
})

userSchema.virtual('bmiCategory').get(function () {
  const b = this.bmi
  if (b === null) return null
  if (b < 18.5) return 'Underweight'
  if (b < 25)   return 'Normal'
  if (b < 30)   return 'Overweight'
  return 'Obese'
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

export default mongoose.model('User', userSchema)
