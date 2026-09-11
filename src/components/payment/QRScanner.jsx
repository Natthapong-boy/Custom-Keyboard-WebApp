import React from 'react'

export default function QRScanner({ onSimulateSuccess, isVerified }) {
  return (
    <div className="space-y-6 text-center py-4">
      <div className="qr-scanner-box">
        <span className="qr-scanner-corner qr-corner-tl"></span>
        <span className="qr-scanner-corner qr-corner-tr"></span>
        <span className="qr-scanner-corner qr-corner-bl"></span>
        <span className="qr-scanner-corner qr-corner-br"></span>
        <div className="qr-laser-line"></div>

        {/* SVG Mock QR Code with Key Craft Brand Center */}
        <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
          <rect x="5" y="5" width="25" height="25" fill="#a855f7" />
          <rect x="10" y="10" width="15" height="15" fill="#090510" />
          <rect x="13" y="13" width="9" height="9" fill="#c084fc" />

          <rect x="70" y="5" width="25" height="25" fill="#a855f7" />
          <rect x="75" y="10" width="15" height="15" fill="#090510" />
          <rect x="78" y="13" width="9" height="9" fill="#c084fc" />

          <rect x="5" y="70" width="25" height="25" fill="#a855f7" />
          <rect x="10" y="75" width="15" height="15" fill="#090510" />
          <rect x="13" y="78" width="9" height="9" fill="#c084fc" />

          <rect x="36" y="8" width="6" height="14" fill="#a855f7" />
          <rect x="46" y="16" width="18" height="6" fill="#c084fc" />
          <rect x="8" y="36" width="14" height="6" fill="#a855f7" />
          <rect x="36" y="36" width="28" height="28" fill="#38bdf8" rx="4" />
          <text x="50" y="54" fill="#000" fontSize="14" fontWeight="bold" textAnchor="middle">✦</text>
          <rect x="68" y="44" width="24" height="6" fill="#a855f7" />
          <rect x="44" y="68" width="8" height="24" fill="#c084fc" />
          <rect x="56" y="78" width="16" height="14" fill="#a855f7" />
          <rect x="76" y="70" width="18" height="8" fill="#c084fc" />
        </svg>
      </div>

      <div>
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-purple-300 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Scan with Mobile Banking / PromptPay
        </div>
        <p className="text-xs text-[#a09ca9]">
          Auto-expires in <strong className="text-white font-mono">04:59</strong> • Real-time status sync enabled
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onSimulateSuccess}
          className="text-xs font-mono bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg border border-white/20 transition-all inline-flex items-center gap-2"
        >
          <span>📱</span> Simulate Successful QR Scan
        </button>
        {isVerified && (
          <div className="mt-3 text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
            <span>✓</span> QR Scan Received & Authorized! Click Place Order below.
          </div>
        )}
      </div>
    </div>
  )
}
