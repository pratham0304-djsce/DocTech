const SYMPTOM_DB = {
  headache:        { conditions: ['Migraine','Tension Headache','Hypertension','Dehydration'], severity: 'mild' },
  fever:           { conditions: ['Viral Infection','Flu','COVID-19','Malaria','Typhoid'], severity: 'moderate' },
  cough:           { conditions: ['Common Cold','Flu','Bronchitis','COVID-19','Asthma'], severity: 'mild' },
  fatigue:         { conditions: ['Anemia','Thyroid Disorder','Diabetes','Depression'], severity: 'mild' },
  chest_pain:      { conditions: ['Angina','Heart Attack','GERD','Anxiety'], severity: 'severe' },
  breathlessness:  { conditions: ['Asthma','COPD','Pneumonia','Heart Failure'], severity: 'severe' },
  nausea:          { conditions: ['Gastritis','Food Poisoning','Migraine','Pregnancy'], severity: 'mild' },
  vomiting:        { conditions: ['Gastroenteritis','Food Poisoning','Appendicitis'], severity: 'moderate' },
  diarrhea:        { conditions: ['Gastroenteritis','IBS','Food Poisoning','Infection'], severity: 'moderate' },
  back_pain:       { conditions: ['Muscle Strain','Herniated Disc','Kidney Stone','Sciatica'], severity: 'moderate' },
  joint_pain:      { conditions: ['Arthritis','Gout','Lupus','Fibromyalgia'], severity: 'moderate' },
  dizziness:       { conditions: ['Vertigo','Low Blood Pressure','Anemia','Inner Ear Infection'], severity: 'mild' },
  sore_throat:     { conditions: ['Pharyngitis','Tonsillitis','Strep Throat','Cold'], severity: 'mild' },
  rash:            { conditions: ['Allergy','Eczema','Psoriasis','Chickenpox'], severity: 'mild' },
  abdominal_pain:  { conditions: ['Appendicitis','Gastritis','IBS','Kidney Stone'], severity: 'moderate' },
  eye_pain:        { conditions: ['Conjunctivitis','Glaucoma','Eye Strain'], severity: 'mild' },
  swelling:        { conditions: ['Edema','Deep Vein Thrombosis','Infection','Injury'], severity: 'moderate' },
}

const SPECIALIST = { mild: 'General Physician', moderate: 'Internal Medicine Specialist', severe: 'Emergency Care Specialist' }
const ORDER      = { mild: 1, moderate: 2, severe: 3 }

// POST /api/symptoms/analyze
export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Provide a non-empty array of symptoms' })
    }

    let maxSeverity = 'mild'
    const matched = []

    symptoms.forEach(s => {
      const key = s.toLowerCase().replace(/\s+/g, '_')
      if (SYMPTOM_DB[key]) {
        matched.push({ symptom: key, ...SYMPTOM_DB[key] })
        if (ORDER[SYMPTOM_DB[key].severity] > ORDER[maxSeverity]) maxSeverity = SYMPTOM_DB[key].severity
      }
    })

    const possibleConditions = [...new Set(matched.flatMap(m => m.conditions))]

    res.json({
      symptoms,
      matchedSymptoms: matched,
      possibleConditions,
      overallSeverity: maxSeverity,
      recommendedSpecialist: SPECIALIST[maxSeverity],
      disclaimer: 'For informational purposes only. Consult a qualified doctor for proper diagnosis.',
      analyzedAt: new Date().toISOString(),
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
