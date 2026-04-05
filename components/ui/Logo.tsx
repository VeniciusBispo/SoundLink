export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SoundLink logo"
      className="text-brand-primary"
    >
      <rect width="48" height="48" rx="12" fill="currentColor" />
      {/* Music note shape */}
      <rect x="15" y="12" width="5" height="20" rx="2.5" fill="white" />
      <rect x="15" y="12" width="18" height="5" rx="2.5" fill="white" />
      <circle cx="13" cy="32" r="5" fill="white" />
      <rect x="28" y="16" width="5" height="16" rx="2.5" fill="white" />
      <circle cx="26" cy="32" r="5" fill="white" />
    </svg>
  )
}
