interface HeroVisualProps {
  className?: string
}

export default function HeroVisual({ className = "" }: HeroVisualProps) {
  return (
    <div className={`hero-visual-container ${className}`}>
      <svg 
        viewBox="20 30 320 390"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="hero-svg"
      > {/* 0 0 490 460 */}
        <defs>
          {/* Gradients */}
          <linearGradient id="card" x1="0" y1="0" x2="180" y2="130">
            <stop offset="0%" stopColor="#1A2235"/>
            <stop offset="100%" stopColor="#111827"/>
          </linearGradient>
          <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#63B3ED"/>
            <stop offset="100%" stopColor="#4299E1"/>
          </linearGradient>
          
          {/* Shadows & Glows */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.5"/>
          </filter>
          <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ==================== 1. JALUR TRANSVOLT (S-Kebelik) ==================== */}
        {/* Line 1: Kanan Prompt Card (260, 75) ke Kanan CPU (210, 230) */}
        <path 
          d="M 260 75 H 300 Q 315 75, 315 90 V 215 Q 315 230, 300 230 H 210" 
          stroke="#63b3ed" 
          strokeOpacity="0.2" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <path 
          d="M 260 75 H 300 Q 315 75, 315 90 V 215 Q 315 230, 300 230 H 210" 
          stroke="#63b3ed" 
          strokeOpacity="0.6" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        {/* Titik Data Oranye Bergerak dari Kanan Card ke Kanan CPU */}
        <circle r="4" fill="#f6ad55" filter="url(#dot-glow)">
          <animateMotion 
            dur="2.5s" 
            repeatCount="indefinite" 
            path="M 260 75 H 300 Q 315 75, 315 90 V 215 Q 315 230, 300 230 H 210" 
          />
        </circle>

        {/* Line 2: Kiri CPU (150, 230) ke Kiri Target Platform (120, 360) */}
        <path 
          d="M 150 230 H 60 Q 45 230, 45 245 V 345 Q 45 360, 60 360 H 120" 
          stroke="#63b3ed" 
          strokeOpacity="0.2" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <path 
          d="M 150 230 H 60 Q 45 230, 45 245 V 345 Q 45 360, 60 360 H 120" 
          stroke="#63b3ed" 
          strokeOpacity="0.6" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        {/* Titik Data Oranye Bergerak dari Kiri CPU ke Kiri Platform */}
        <circle r="4" fill="#f6ad55" filter="url(#dot-glow)">
          <animateMotion 
            dur="2.5s" 
            begin="0.8s" /* Efek jeda mengalir */
            repeatCount="indefinite" 
            path="M 150 230 H 60 Q 45 230, 45 245 V 345 Q 45 360, 60 360 H 120" 
          />
        </circle>


        {/* ==================== 2. PROMPT CARD (ATAS - TENGAH) ==================== */}
        <g transform="translate(90, 10)" >
          {/* Card Base */}
          <rect x="-4" y="45" width="170" height="40" rx="15" fill="url(#card)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          {/* Spark Icon */}
          <path
  transform="translate(-17, 28)"
  d="M28 30L30.5 35L36 37.5L30.5 40L28 45L25.5 40L20 37.5L25.5 35L28 30Z"
  fill="url(#accent)"
/>
          
          {/* Input Box */}
          <rect x="24" y="52" width="132" height="26" rx="8" fill="#0F172A" stroke="#334155"/>
          <rect x="34" y="61" width="70" height="6" rx="3" fill="#64748B"/>
          <rect x="110" y="58" width="2" height="12" rx="1" fill="#63B3ED"/>
          
        </g>


        {/* ==================== 3. CHIP CPU AI (TENGAH) ==================== */}
        <g transform="translate(150, 200)">
          {/* CPU Pins (Kiri & Kanan) */}
          <rect x="-4" y="12" width="4" height="4" rx="1" fill="#63B3ED" />
          <rect x="-4" y="28" width="4" height="4" rx="1" fill="#63B3ED" />
          <rect x="-4" y="44" width="4" height="4" rx="1" fill="#63B3ED" />
          <rect x="60" y="12" width="4" height="4" rx="1" fill="#63B3ED" />
          <rect x="60" y="28" width="4" height="4" rx="1" fill="#63B3ED" />
          <rect x="60" y="44" width="4" height="4" rx="1" fill="#63B3ED" />
          
          {/* CPU Body */}
          <rect x="0" y="0" width="60" height="60" rx="14" fill="#0d1220" stroke="#63B3ED" strokeWidth="2" filter="url(#glow-neon)"/>
          <rect x="12" y="12" width="36" height="36" rx="8" fill="#152035" stroke="rgba(99,179,237,0.3)" strokeWidth="1" />
          
          {/* AI Text Center */}
          <text x="30" y="36" fill="#63B3ED" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">AI</text>
        </g>


        {/* ==================== 4. CAROUSEL PREVIEW (BAWAH - TENGAH) ==================== */}
        <g transform="translate(120, 320)" filter="url(#shadow)">
          {/* Platform Mockup Base */}
          <rect x="5" y="5" width="110" height="70" rx="12" fill="#111827" stroke="#63b3ed" strokeWidth="1.5" strokeOpacity="0.5"/>
          {/* Inner Slide */}
          <rect x="15" y="15" width="38" height="50" rx="6" fill="#1A2235" stroke="#334155"/>
          {/* Mini Image inside slide */}
          <rect x="21" y="21" width="26" height="26" rx="4" fill="#0d1220"/>
          <circle cx="34" cy="34" r="3" fill="#f6ad55"/>
          {/* Right Text Mockups */}
          <rect x="62" y="20" width="40" height="5" rx="2.5" fill="#63B3ED"/>
          <rect x="62" y="32" width="30" height="4" rx="2" fill="#334155"/>
          <rect x="62" y="42" width="35" height="4" rx="2" fill="#334155"/>
          <rect x="62" y="52" width="20" height="4" rx="2" fill="#334155"/>
        </g>
      </svg>
    </div>
  )
}
