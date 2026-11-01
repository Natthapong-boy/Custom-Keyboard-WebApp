import React, { useState, useEffect, useRef, useMemo } from 'react'
import Icon from './Icon'

/**
 * Reusable Custom Dropdown Component
 * Features:
 * - Always opens downwards (absolute top-full left-0 z-50 max-h-60 overflow-y-auto)
 * - Beautiful KeyCraft purple theme with smooth transitions
 * - Supports flat options [{ label, value }], strings ['Item 1', 'Item 2'], and grouped options [{ group, options }]
 * - Highlights active selection with checkmark icon and purple accent
 * - Closes on click-outside and Escape key
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'เลือกรายการ...',
  className = '',
  buttonClassName = '',
  id,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Normalize option whether it is a string, number, or object { label, value }
  const normalizeOption = (opt) => {
    if (opt === null || opt === undefined) return { label: '', value: '' }
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { label: String(opt), value: String(opt) }
    }
    return {
      label: opt.label !== undefined ? opt.label : String(opt.value),
      value: opt.value !== undefined ? opt.value : opt.label
    }
  }

  // Determine current display label from options (flat or grouped)
  const currentLabel = useMemo(() => {
    for (const rawItem of options) {
      if (rawItem && rawItem.group && Array.isArray(rawItem.options)) {
        const found = rawItem.options.map(normalizeOption).find(opt => String(opt.value) === String(value))
        if (found) return found.label
      } else if (rawItem) {
        const item = normalizeOption(rawItem)
        if (String(item.value) === String(value)) {
          return item.label
        }
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
    if (disabled) return
    if (onChange) onChange(val)
    setIsOpen(false)
  }

  const renderOption = (rawOpt) => {
    const opt = normalizeOption(rawOpt)
    const isSelected = String(opt.value) === String(value)
    return (
      <button
        type="button"
        key={String(opt.value)}
        onClick={() => handleSelect(opt.value)}
        className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer ${
          isSelected
            ? 'bg-purple-100 text-purple-900 font-bold'
            : 'text-slate-700 hover:bg-purple-100 hover:text-purple-900'
        }`}
      >
        <span className="truncate">{opt.label}</span>
        {isSelected && (
          <span className="text-purple-600 font-bold text-xs shrink-0 ml-1.5 flex items-center">
            <Icon name="check" />
          </span>
        )}
      </button>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-30' : 'z-10'} ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 text-xs sm:text-sm font-semibold flex items-center justify-between text-left transition-all cursor-pointer shadow-xs ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
            : isOpen
            ? 'border-purple-500 ring-2 ring-purple-400/40'
            : 'border-purple-300 hover:border-purple-400'
        } ${buttonClassName}`}
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
      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl border border-purple-100 shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 focus:outline-none animate-fadeIn space-y-0.5"
          style={{ position: 'absolute', top: '100%', left: 0 }}
        >
          {options.map((item, idx) => {
            // Grouped optgroup section
            if (item && item.group && Array.isArray(item.options)) {
              return (
                <div key={item.group || idx} className="pt-2 first:pt-0">
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
              <div key={String(item?.value || item || idx)}>
                {renderOption(item)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

