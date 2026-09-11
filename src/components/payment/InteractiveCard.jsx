import React from 'react'

export default function InteractiveCard({ cardData, isFlipped, onToggleFlip }) {
  return (
    <div>
      <div
        className="card-scene"
        onClick={onToggleFlip}
        title="Click card to flip"
      >
        <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="card-face card-front">
            <div className="flex justify-between items-center">
              <div className="card-chip"></div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#d8b4fe]">
                KEY CRAFT BLACK
              </span>
            </div>

            <div className="card-number-display">
              {cardData.number || '•••• •••• •••• ••••'}
            </div>

            <div className="card-meta-row">
              <div>
                <div className="text-[9px] text-[#9c8ea8]">CARDHOLDER</div>
                <div className="card-holder-name">{cardData.name || 'YOUR NAME'}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-[#9c8ea8]">EXPIRES</div>
                <div className="font-mono text-xs font-bold text-white">
                  {cardData.expiry || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="card-face card-back">
            <div className="card-magnetic-stripe"></div>
            <div className="card-cvv-band">
              <span>CVV: </span>
              <span>{cardData.cvv || '•••'}</span>
            </div>
            <div className="px-6 text-[9px] font-mono text-[#8c8196] text-right mt-4">
              AUTHORIZED SIGNATURE • ENCRYPTED CYBER DEBIT
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleFlip}
          className="text-[11px] font-mono text-purple-400 hover:text-white transition-colors"
        >
          🔄 {isFlipped ? 'Show Front of Card' : 'Flip Card to inspect CVV'}
        </button>
      </div>
    </div>
  )
}
