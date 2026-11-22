export default function PawIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="12" cy="15.5" rx="5" ry="4" />
      <ellipse cx="5.6" cy="9.6" rx="2.3" ry="2.9" transform="rotate(-18 5.6 9.6)" />
      <ellipse cx="9.9" cy="6.6" rx="2.2" ry="2.9" transform="rotate(-6 9.9 6.6)" />
      <ellipse cx="14.3" cy="6.6" rx="2.2" ry="2.9" transform="rotate(6 14.3 6.6)" />
      <ellipse cx="18.6" cy="9.6" rx="2.3" ry="2.9" transform="rotate(18 18.6 9.6)" />
    </svg>
  );
}
