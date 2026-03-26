import mongoose from 'mongoose'

const chatSessionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, default: 'New Consultation' },
  // Centralized patient state — synced with Python microservice
  patientState: {
    symptoms:            [String],
    duration:            { type: String, default: '' },
    severity:            { type: String, default: '' },
    painType:            { type: String, default: '' },
    associatedSymptoms:  [String],
    medicalHistory:      [String],
    reports:             [String],
    riskLevel:           { type: String, default: '' },
    lastDiagnosis:       [{ name: String, probability: String, description: String }],
    lastUpdated:         { type: Date, default: Date.now },
  },
}, { timestamps: true })

export default mongoose.model('ChatSession', chatSessionSchema)
