import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </BaseIcon>
  );
}

export function ShopsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 8.5 4.5 4h15L21 8.5" />
      <path d="M4 8.5V20h16V8.5" />
      <path d="M3 8.5c0 2 1.4 3 3 3s3-1 3-3c0 2 1.4 3 3 3s3-1 3-3c0 2 1.4 3 3 3s3-1 3-3" />
      <path d="M9 20v-6h6v6" />
    </BaseIcon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19c.6-3 3-4.5 5.5-4.5S14 16 14.6 19" />
      <circle cx="16.5" cy="10" r="2.4" />
      <path d="M15 14.6c2.2-.2 4.2 1 5 3.4" />
    </BaseIcon>
  );
}

export function CustomersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4 20c1-4 4.5-6 8-6s7 2 8 6" />
    </BaseIcon>
  );
}

export function TransactionsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 9c1-1 5-1 5 1.5 0 2.5-5 1-5 3.5 0 2 4 2.5 5 1.5" />
      <path d="M12 6.5V8M12 16v1.5" />
    </BaseIcon>
  );
}

export function JournalIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 4.5h10.5A2.5 2.5 0 0 1 19 7v13H7.5A2.5 2.5 0 0 1 5 17.5V6.5a2 2 0 0 1 1-2z" />
      <path d="M8 4.5V20" />
      <path d="M11 9h5M11 13h4M11 17h3" />
    </BaseIcon>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a2 2 0 0 1 2 2v.5" />
      <path d="M4 7.5V17a2 2 0 0 0 2 2h12.5a1.5 1.5 0 0 0 1.5-1.5V10a1.5 1.5 0 0 0-1.5-1.5H6.5A2.5 2.5 0 0 1 4 7.5z" />
      <circle cx="16" cy="13.5" r="1.2" />
    </BaseIcon>
  );
}

export function AiIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10v2a3 3 0 0 0 2 2.8V17a3 3 0 0 0 5.5 1.7" />
      <path d="M15 4a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 10v2a3 3 0 0 1-2 2.8V17a3 3 0 0 1-5.5 1.7" />
      <path d="M12 5v15" />
    </BaseIcon>
  );
}

export function AuditIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 4 6v6c0 4.6 3.3 8.4 8 9 4.7-.6 8-4.4 8-9V6l-8-3z" />
      <path d="m9 12 2.2 2L15 10" />
    </BaseIcon>
  );
}

export function SmsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M8 9h8M8 13h5" />
    </BaseIcon>
  );
}

export function SystemIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="4" width="17" height="6" rx="1.5" />
      <rect x="3.5" y="14" width="17" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </BaseIcon>
  );
}

export function LogsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </BaseIcon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="2.6" />
      <path d="M19 12a7 7 0 0 0-.1-1.4l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.4-1.4L13.7 3h-3.4l-.5 2.3a7 7 0 0 0-2.4 1.4l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .5 0 1 .1 1.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.4 1.4l.5 2.3h3.4l.5-2.3a7 7 0 0 0 2.4-1.4l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.4z" />
    </BaseIcon>
  );
}
