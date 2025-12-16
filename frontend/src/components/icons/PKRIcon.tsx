export default function PKRIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pkrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#pkrGradient)" strokeWidth="2" fill="none"/>
      <text x="12" y="16" textAnchor="middle" fill="url(#pkrGradient)" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">
        ₨
      </text>
    </svg>
  );
}
