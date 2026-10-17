import React, { useState, useEffect, useRef, useMemo } from 'react'
import Icon from './Icon'

/**
 * Reusable Custom Dropdown Component
 * Features:
 * - Always opens downwards (absolute top-full left-0 z-50 max-h-60 overflow-y-auto)
 * - Beautiful KeyCraft purple theme with smooth transitions
 * - Supports flat options [{ label, value }] and grouped options [{ group, options: [{ label, value }] }]
 * - Highlights active selection with checkmark icon
 * - Closes on click-outside and Escape key
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'เลือกรายการ...',
  className = '',
  id
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Determine current display label from options (flat or grouped)
  const currentLabel = useMemo(() => {
    for (const item of options) {
      if (item.group && Array.isArray(item.options)) {
        const found = item.options.find(opt => String(opt.value) === String(value))
        if (found) return found.label
      } else if (String(item.value) === String(value)) {
        return item.label
      }
    }
    return placeholder || value || ''
  }, [options, value, placeholder])

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSelect = (val) => {
    if (onChange) onChange(val)
    setIsOpen(false)
  }

  const renderOption = (opt) => {
    const isSelected = String(opt.value) === String(value)
    return (
      <button
        type="button"
        key={String(opt.value)}
        onClick={() => handleSelect(opt.value)}
        className={`w-full px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer ${
          isSelected
            ? 'bg-purple-100 text-purple-900 font-bold'
            : 'text-slate-700 hover:bg-purple-50/80 hover:text-purple-700'
        }`}
      >
        <span className="truncate">{opt.label}</span>
        {isSelected && (
          <span className="text-purple-600 font-bold text-xs shrink-0 ml-1.5">
            <Icon name="check" />
          </span>
        )}
      </button>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 text-sm font-semibold flex items-center justify-between text-left transition-all cursor-pointer shadow-xs ${
          isOpen
            ? 'border-purple-500 ring-2 ring-purple-500'
            : 'border-purple-300 hover:border-purple-400'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{currentLabel}</span>
        <span
          className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-purple-600' : ''
          }`}
        >
          <Icon name="chevronDown" />
        </span>
      </button>

      {/* Downward Listbox */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl border border-purple-200 shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5 focus:outline-none animate-fadeIn divide-y divide-purple-50"
          style={{ position: 'absolute', top: '100%', left: 0 }}
        >
          {options.map((item, idx) => {
            // Grouped optgroup section
            if (item.group && Array.isArray(item.options)) {
              return (
                <div key={item.group || idx} className="pt-2">
                  <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-purple-900/70 bg-purple-50/70 rounded-lg mb-1">
                    {item.group}
                  </div>
                  <div className="space-y-0.5">
                    {item.options.map(opt => renderOption(opt))}
                  </div>
                </div>
              )
            }
            // Flat option item
            return (
              <div key={String(item.value || idx)} className="space-y-0.5">
                {renderOption(item)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
