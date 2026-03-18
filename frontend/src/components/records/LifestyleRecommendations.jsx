import { Salad, PersonStanding, Moon, Scale, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useState } from 'react'

const CATEGORIES = [
  {
    key: 'diet',
    label: 'Diet & Nutrition',
    icon: Salad,
    tips: [
      'Reduce processed sugar and refined carbohydrates in your daily diet.',
      'Include 5 servings of fruits and vegetables every day.',
      'Drink 8–10 glasses of water. Start your morning with warm lemon water.',
      'Limit sodium intake to less than 2,300 mg per day.',
      'Choose whole grains (oats, brown rice, quinoa) over white flour products.',
      'Eat at regular intervals — do not skip breakfast.',
    ],
  },
  {
    key: 'exercise',
    label: 'Exercise',
    icon: PersonStanding,
    tips: [
      'Walk briskly for at least 30 minutes every day.',
      'Include 2 sessions of strength training per week.',
      'Stretch for 10 minutes every morning to improve flexibility.',
      'Take short 5-minute walks every hour if you have a desk job.',
      'Practice yoga or tai chi to improve balance and reduce stress.',
    ],
  },
  {
    key: 'sleep',
    label: 'Sleep',
    icon: Moon,
    tips: [
      'Aim for 7–9 hours of quality sleep per night.',
      'Keep a consistent sleep-wake schedule, even on weekends.',
      'Avoid screens (phone, TV) for at least 1 hour before bed.',
      'Keep your bedroom cool, dark, and quiet for better rest.',
      'Avoid caffeine after 2 PM for deeper sleep at night.',
    ],
  },
  {
    key: 'weight',
    label: 'Weight Management',
    icon: Scale,
    tips: [
      'Maintain a calorie deficit of 300–500 kcal/day for gradual, safe weight loss.',
      'Track your meals — even a rough log helps with mindful eating.',
      'Avoid late-night eating; finish dinner 2–3 hours before bed.',
      'Replace sugary drinks with water, green tea, or black coffee.',
      'Focus on sustainable habits — not crash diets.',
    ],
  },
]

function CategoryCard({ cat }) {
  const [open, setOpen] = useState(true)
  const Icon = cat.icon

  return (
    <div className="rounded-2xl border border-primary-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-primary-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary-700" />
        </div>
        <span className="flex-1 text-left text-sm font-bold text-gray-800">{cat.label}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-primary-400" />
          : <ChevronDown className="w-4 h-4 text-primary-400" />
        }
      </button>

      {open && (
        <ul className="px-4 pb-4 space-y-2">
          {cat.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 bg-primary-50 rounded-xl px-3 py-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function LifestyleRecommendations() {
  return (
    <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-primary-50">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Lifestyle Recommendations</h2>
          <p className="text-[11px] text-gray-400">AI-generated personalised health guidance</p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <CategoryCard key={cat.key} cat={cat} />
          ))}
        </div>
        <p className="text-[11px] text-gray-300 text-center pt-4">
          AI suggestions are general in nature. Consult your doctor for personalised advice.
        </p>
      </div>
    </div>
  )
}
