export default function CircuitPattern() {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-10 z-0" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="50%" stopColor="#2563eb" stopOpacity="1" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
        </linearGradient>
        <pattern id="circuitPattern" x="0" y="0" width="300" height="200" patternUnits="userSpaceOnUse">
          {/* Horizontal traces */}
          <path d="M0 30 L100 30 L120 50 L220 50" stroke="url(#circuitGradient)" strokeWidth="2" fill="none"/>
          <path d="M0 70 L80 70 L100 90 L240 90" stroke="url(#circuitGradient)" strokeWidth="2" fill="none"/>
          <path d="M0 110 L90 110 L110 130 L260 130" stroke="url(#circuitGradient)" strokeWidth="2" fill="none"/>
          <path d="M0 150 L70 150 L90 170 L230 170" stroke="url(#circuitGradient)" strokeWidth="2" fill="none"/>
          
          {/* Dotted connections */}
          <line x1="100" y1="30" x2="120" y2="50" stroke="#7c3aed" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
          <line x1="200" y1="50" x2="220" y2="90" stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
          
          {/* Nodes (circles) */}
          <circle cx="100" cy="30" r="4" fill="#06b6d4"/>
          <circle cx="220" cy="50" r="4" fill="none" stroke="#2563eb" strokeWidth="1.5"/>
          <circle cx="80" cy="70" r="4" fill="#7c3aed"/>
          <circle cx="240" cy="90" r="4" fill="#7c3aed"/>
          <circle cx="90" cy="110" r="4" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
          <circle cx="260" cy="130" r="4" fill="#ec4899"/>
          
          {/* Rectangular components */}
          <rect x="96" y="86" width="8" height="8" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
          <rect x="106" y="126" width="8" height="8" fill="#ec4899" opacity="0.7"/>
          
          {/* Cross connections */}
          <path d="M180 60 L190 60 M185 55 L185 65" stroke="#2563eb" strokeWidth="1.5" opacity="0.4"/>
          <circle cx="150" cy="110" r="1.5" fill="#7c3aed" opacity="0.6"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuitPattern)" />
    </svg>
  );
}
