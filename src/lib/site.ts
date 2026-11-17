export const SITE = {
  name: "Relay",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://relay-seven-lovat.vercel.app",
  contactEmail: "info.relay.chat@gmail.com",
  jurisdiction: "Pakistan",
  minAge: 13,
  legalUpdated: "17 November 2026",
} as const;
