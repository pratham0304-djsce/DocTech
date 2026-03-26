// Step progress indicator displayed in the chat header
export default function ProgressIndicator({ current, total = 6 }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-[#238370] whitespace-nowrap">
        Step {current} of {total}
      </span>
      <div className="flex-1 h-1.5 bg-[#238370]/15 rounded-full overflow-hidden min-w-[80px]">
        <div
          className="h-full bg-[#238370] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
