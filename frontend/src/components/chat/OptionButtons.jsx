// Reusable pill-shaped option buttons for quick selections
export default function OptionButtons({ options, onSelect, selected = [] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt) => {
        const isSelected = Array.isArray(selected)
          ? selected.includes(opt.value ?? opt)
          : selected === (opt.value ?? opt)

        return (
          <button
            key={opt.value ?? opt}
            onClick={() => onSelect(opt.value ?? opt)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 active:scale-95 ${
              isSelected
                ? 'bg-[#238370] text-white border-[#238370] shadow-sm'
                : 'bg-white text-[#238370] border-[#238370]/30 hover:border-[#238370] hover:bg-[#238370]/5'
            }`}
          >
            {opt.label ?? opt}
          </button>
        )
      })}
    </div>
  )
}
