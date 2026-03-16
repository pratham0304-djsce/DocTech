export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  const isGood = trend === 'good'
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow group">
      <div className="w-11 h-11 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center shrink-0 transition-colors">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">{title}</p>
        <p className="text-xl font-extrabold text-gray-900 leading-tight truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        {trend && (
          <span className={`inline-block text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${
            isGood
              ? 'bg-primary-50 text-primary-700'
              : trend === 'Underweight' || trend === 'Overweight' || trend === 'Obese'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {isGood ? '✓ Normal' : trend}
          </span>
        )}
      </div>
    </div>
  )
}
