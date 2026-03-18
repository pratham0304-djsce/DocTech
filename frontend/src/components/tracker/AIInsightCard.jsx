import { Sparkles, Info } from 'lucide-react'

const generateInsights = ({ bmi, bp, weight, weightHistory }) => {
  const insights = []

  if (bmi) {
    const b = parseFloat(bmi)
    if (b < 18.5) insights.push({ icon: '⚖️', text: 'Your BMI is below normal range. Consider increasing nutrient intake.' })
    else if (b >= 25 && b < 30) insights.push({ icon: '⚖️', text: 'Your BMI is slightly high. Light physical activity may help.' })
    else if (b >= 30) insights.push({ icon: '⚠️', text: 'Your BMI is in the obese range. Consider consulting a healthcare provider.' })
    else insights.push({ icon: '✅', text: 'Your BMI is in the healthy range. Keep up the good habits!' })
  }

  if (bp) {
    const sys = parseInt(bp.split('/')[0])
    if (!isNaN(sys)) {
      if (sys >= 130) insights.push({ icon: '🩺', text: 'Blood pressure readings are above normal. Monitor closely and consider reducing salt intake.' })
      else if (sys < 90) insights.push({ icon: '🩺', text: 'Blood pressure appears low. Stay hydrated and avoid prolonged standing.' })
      else insights.push({ icon: '✅', text: 'Blood pressure is within normal range.' })
    }
  }

  // Fallback
  if (insights.length === 0) {
    insights.push({ icon: '💡', text: 'Log your weight and height to get personalized health insights.' })
  }

  return insights.slice(0, 2)
}

export default function AIInsightCard({ metrics }) {
  const { bmi, bp } = metrics
  const insights = generateInsights({ bmi, bp })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#238370]/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#238370]/10 flex items-center justify-center">
          <Sparkles size={16} className="text-[#238370]" />
        </div>
        <h2 className="font-semibold text-gray-800">AI Insights</h2>
        <span className="ml-auto text-[10px] text-[#238370]/50 bg-[#238370]/5 px-2 py-0.5 rounded-full font-medium">
          Powered by AI
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#238370]/5 border border-[#238370]/10"
          >
            <span className="text-base mt-0.5 flex-shrink-0">{insight.icon}</span>
            <p className="text-sm text-gray-600 leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-[#238370]/5">
        <Info size={13} className="text-[#238370]/50 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-[#238370]/50 leading-relaxed">
          AI insights are for informational purposes only. Always consult a licensed healthcare professional.
        </p>
      </div>
    </div>
  )
}
