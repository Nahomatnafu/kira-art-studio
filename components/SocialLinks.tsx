export function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.821 5.134a4.474 4.474 0 0 1-1.11-2.904h-3.257v13.073a2.737 2.737 0 1 1-2.73-2.958c.29 0 .578.046.854.137V9.15a6.143 6.143 0 0 0-.854-.059 6.025 6.025 0 1 0 6.001 6.211V8.62A7.724 7.724 0 0 0 20.25 10V6.747a4.47 4.47 0 0 1-3.429-1.613Z" />
    </svg>
  );
}
export default function SocialLinks({
  instagram,
  tiktok,
  className = "social-links",
}: {
  instagram: string;
  tiktok: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <a
        className="social-icon"
        href={instagram}
        target="_blank"
        rel="noreferrer"
        aria-label="Visit Kira Art Studio on Instagram"
        title="Instagram"
      >
        <InstagramIcon />
      </a>
      <a
        className="social-icon"
        href={tiktok}
        target="_blank"
        rel="noreferrer"
        aria-label="Visit Kira Art Studio on TikTok"
        title="TikTok"
      >
        <TikTokIcon />
      </a>
    </div>
  );
}
