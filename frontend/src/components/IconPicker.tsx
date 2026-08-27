import { AVAILABLE_ICONS } from '../lib/icons'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  label?: string
}

export function IconPicker({ value, onChange, label = 'Icon' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedIcon = AVAILABLE_ICONS.find((i) => i.name === value)

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-dark-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm border border-dark-600 rounded bg-dark-700 hover:bg-dark-600 transition text-dark-100 text-left"
        >
          <span className="flex items-center gap-2">
            {selectedIcon && <selectedIcon.icon size={16} />}
            {selectedIcon?.label || 'Select icon...'}
          </span>
          <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
            {AVAILABLE_ICONS.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onChange(item.name)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-dark-600 transition border-b border-dark-600 last:border-b-0"
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                {value === item.name && <span className="ml-auto text-red-400">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
