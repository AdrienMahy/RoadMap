import { getPriorityLabel } from '../lib/status'
import { useState } from 'react'
import { ChevronDown, AlertOctagon, AlertTriangle, Minus } from 'lucide-react'

interface PrioritySelectorProps {
  value: string
  onChange: (priority: string) => void
  label?: string
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: Minus, color: 'text-blue-300', bgColor: 'bg-blue-600/20' },
  { value: 'medium', label: 'Medium', icon: Minus, color: 'text-yellow-300', bgColor: 'bg-yellow-600/20' },
  { value: 'high', label: 'High', icon: AlertTriangle, color: 'text-orange-300', bgColor: 'bg-orange-600/20' },
  { value: 'critical', label: 'Critical', icon: AlertOctagon, color: 'text-red-300', bgColor: 'bg-red-600/20' },
]

export function PrioritySelector({
  value = 'medium',
  onChange,
  label = 'Priority',
}: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = PRIORITY_OPTIONS.find((p) => p.value === value)

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
          <span className={`flex items-center gap-2 ${selected?.color}`}>
            {selected && <selected.icon size={14} />}
            {selected?.label || 'Select priority...'}
          </span>
          <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded shadow-lg z-50">
            {PRIORITY_OPTIONS.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-dark-600 transition border-b border-dark-600 last:border-b-0"
                >
                  <span className={`flex items-center gap-2 ${option.color}`}>
                    <IconComponent size={14} />
                    {option.label}
                  </span>
                  {value === option.value && <span className="text-red-400">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
