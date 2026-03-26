import { useRef } from 'react'
import { Paperclip } from 'lucide-react'

const ACCEPTED = '.jpg,.jpeg,.png,.pdf,.dcm'

export default function UploadButton({ onUpload }) {
  const ref = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = ''
    }
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        title="Upload X-ray, MRI, CT or Lab Report"
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-[#238370]/20 text-[#238370]/60 hover:text-[#238370] hover:border-[#238370] hover:bg-[#238370]/5 transition-all"
      >
        <Paperclip size={16} />
      </button>
    </>
  )
}
