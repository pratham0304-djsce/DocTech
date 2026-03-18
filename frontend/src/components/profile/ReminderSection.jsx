import { Bell, Pill, FlaskConical, Activity, Stethoscope, Clock, Calendar, CheckCheck } from 'lucide-react'

const TYPE_CONFIG = {
  followup:    { label: 'Follow-up',     icon: Stethoscope, color: 'text-primary-600', bg: 'bg-primary-50' },
  medication:  { label: 'Medication',    icon: Pill,        color: 'text-primary-600', bg: 'bg-primary-50' },
  lab:         { label: 'Lab Test',      icon: FlaskConical, color: 'text-primary-600', bg: 'bg-primary-50' },
  checkup:     { label: 'Health Checkup', icon: Activity,   color: 'text-primary-600', bg: 'bg-primary-50' },
}

function ReminderItem({ title, date, time, type = 'followup', done }) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.followup
  const Icon = config.icon
  const isPast = new Date(`${date} ${time}`) < new Date()

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
      done || isPast
        ? 'border-gray-100 bg-gray-50/50 opacity-60'
        : 'border-primary-100 bg-primary-50/30 hover:bg-primary-50'
    }`}>
      <div className={`p-2 rounded-xl ${config.bg} shrink-0`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
        <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 bg-white text-primary-700 text-[11px] font-medium rounded border border-primary-100">
          {config.label}
        </span>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3 text-primary-400" />
            {date}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3 text-primary-400" />
            {time}
          </span>
        </div>
      </div>
      {(done || isPast) && (
        <CheckCheck className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
      )}
    </div>
  )
}

export default function ReminderSection({ reminders = [] }) {
  const upcoming = reminders.filter(r => new Date(`${r.date} ${r.time}`) >= new Date())
  const past = reminders.filter(r => new Date(`${r.date} ${r.time}`) < new Date())

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary-50 rounded-xl">
          <Bell className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Follow-up Reminders</h3>
          <p className="text-xs text-gray-400">{upcoming.length} upcoming · {past.length} completed</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Upcoming</p>
            <div className="space-y-2">
              {upcoming.map((r, i) => <ReminderItem key={i} {...r} />)}
            </div>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Completed</p>
            <div className="space-y-2">
              {past.map((r, i) => <ReminderItem key={i} {...r} done />)}
            </div>
          </div>
        )}

        {reminders.length === 0 && (
          <div className="py-10 text-center">
            <Bell className="w-8 h-8 text-primary-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No reminders scheduled</p>
          </div>
        )}
      </div>
    </div>
  )
}
