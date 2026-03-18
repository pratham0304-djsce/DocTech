import mongoose from 'mongoose'

const patientProfileSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name:             { type: String, required: true, trim: true },
  age:              { type: Number, min: 0, max: 150 },
  gender:           { type: String, enum: ['Male', 'Female', 'Other'] },
  height:           { type: Number }, // cm
  weight:           { type: Number }, // kg
  bloodGroup:       { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'], default: 'Unknown' },
  allergies:        [{ type: String, trim: true }],
  chronicDiseases:  [{ type: String, trim: true }],
  familyHistory:    [{ type: String, trim: true }],
  personalHistory:  { type: String, trim: true, default: '' },
}, {
  timestamps: true,
  // BMI virtual
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
})

patientProfileSchema.virtual('bmi').get(function () {
  if (this.height && this.weight && this.height > 0) {
    const heightM = this.height / 100
    return parseFloat((this.weight / (heightM * heightM)).toFixed(1))
  }
  return null
})

export default mongoose.model('PatientProfile', patientProfileSchema)
