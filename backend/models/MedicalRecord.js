import mongoose from 'mongoose'

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:     { type: String, required: true, trim: true },
  type:      {
    type: String,
    enum: ['diagnosis', 'report', 'prescription', 'consultation', 'lab', 'imaging'],
    required: true,
  },
  fileUrl:   { type: String },           // Cloudinary secure URL
  publicId:  { type: String },           // Cloudinary public_id for deletion
  doctor:    { type: String, trim: true },
  date:      { type: Date, default: Date.now },
  notes:     { type: String, trim: true },
}, { timestamps: true })

export default mongoose.model('MedicalRecord', medicalRecordSchema)
