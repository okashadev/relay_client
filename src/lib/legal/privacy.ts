import { SITE } from "@/lib/site";
import type { LegalSection } from "./types";

export const PRIVACY_INTRO =
  "This policy explains what Relay collects, why we collect it, who we share it with, and the choices you have. We've tried to write it in plain language.";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "overview",
    title: "Who we are",
    blocks: [
      `${SITE.name} is a real-time chat app with direct chats, groups and 24-hour stories. It is run as an independent project. In this policy, "we" and "us" mean the people who run ${SITE.name}.`,
      `By creating an account or using ${SITE.name}, you agree to this policy. If you have questions, write to ${SITE.contactEmail}.`,
    ],
  },
  {
    id: "collect",
    title: "Information we collect",
    blocks: [
      "We collect only what we need to run Relay.",
      {
        items: [
          {
            title: "Account details",
            text: "Your name, username, email address, and an optional bio and profile photo. If you register with email we store a hashed password, never the password itself. If you sign in with Google, we receive your name, email address and profile photo from Google.",
          },
          {
            title: "Messages and attachments",
            text: "Message text, captions, file names and file details are encrypted on your device before they reach us. We store the encrypted data, plus who sent it, which chat it belongs to, when it was sent, its type (text, photo, video, voice or file) and the size of any attachment.",
          },
          {
            title: "Reactions, stories and groups",
            text: "Reaction emoji, stories (text, photos and videos), and group names, descriptions and photos are not end-to-end encrypted, so that your friends and group members can see them. We store them as you submit them.",
          },
          {
            title: "Friends and chat settings",
            text: "Friend requests and friendships, people you've blocked, your per-chat settings (pinned, muted, archived), when messages were delivered and read, and your notifications.",
          },
          {
            title: "Devices and sessions",
            text: "For each device you sign in on we record a device name, browser or app version, operating system, device model (in the mobile app), IP address and when it was last active. This powers the Devices screen and helps us protect your account.",
          },
          {
            title: "Encryption keys",
            text: "Public keys for each of your devices, encrypted chat keys, and your account key (see the next section for how it is protected). Your device's private key stays on your device.",
          },
          {
            title: "Online status",
            text: "Whether you're online and when you were last seen, shown to your friends and chat partners and hidden from anyone you've blocked. Typing indicators are passed on live and are not stored.",
          },
          {
            title: "Technical data",
            text: "Server logs, error reports and rate-limiting counters, kept briefly to keep Relay reliable and secure.",
          },
        ],
      },
    ],
  },
  {
    id: "encryption",
    title: "What encryption does and doesn't cover",
    blocks: [
      "Message text, captions, file names, file types, image sizes and the files themselves are encrypted on your device before they are uploaded. Our servers store the encrypted result.",
      {
        items: [
          {
            title: "Standard protection",
            text: "This is the default. Your account key is also kept on our server, sealed with a key that we hold, so that a new device can show your history without asking you for anything. It means we, as the operator, could technically restore your history.",
          },
          {
            title: "Private mode",
            text: "When you turn on a passphrase in Settings, the server copy is removed. Your account key is protected by your passphrase, and we can't read or restore your history. If you forget the passphrase, it can't be recovered.",
          },
          {
            title: "What we can still see",
            text: "Who is in a chat, when messages are sent, their type and size, who reacted (and with which emoji), your stories, your profile, and your IP address.",
          },
        ],
      },
      {
        callout:
          "Relay runs in a web browser, so the code that performs the encryption is delivered by our servers. A compromised server or a malicious script on the page could weaken that protection. Relay has not had an independent security audit.",
      },
    ],
  },
  {
    id: "use",
    title: "How we use information",
    blocks: [
      {
        list: [
          "To run Relay: deliver messages, show chats and stories, and sync your history across devices.",
          "To keep you and others safe: verify your email, rate-limit abuse, detect suspicious sign-ins and let you log out devices.",
          "To send you messages about your account, such as verification codes and security notices (for example, a password or email change).",
          "To fix problems and improve how Relay works.",
          "To meet legal obligations and enforce our Terms of Service.",
        ],
      },
      "We do not use your messages for advertising, and we do not sell your personal information.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share information with",
    blocks: [
      {
        items: [
          {
            title: "Other users",
            text: "What you choose to share: your name, username, photo, bio, online status, stories, group details, and messages sent to the people in a chat.",
          },
          {
            title: "Service providers",
            text: "Companies that help us run Relay: hosting and database providers; Cloudinary, which stores and delivers your encrypted attachments, profile and group photos, and stories; an email delivery provider for verification codes and notices; and Google, if you choose Google sign-in. They process information only to provide those services to us.",
          },
          {
            title: "Legal and safety",
            text: "If the law requires it, or to protect the rights and safety of our users or the public. Because messages are encrypted, we can't hand over message content we can't read.",
          },
          {
            title: "Changes to the project",
            text: "If Relay is ever transferred or handed to someone else, your information would go with it, and this policy would continue to apply until you are told otherwise.",
          },
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    blocks: [
      {
        list: [
          "A sign-in cookie that keeps you signed in. It can't be read by scripts on the page and is only sent to our API.",
          "A small cookie that tells the website whether you're signed in. It contains no personal information.",
          "A device ID kept in your browser's storage, so we recognise a device you've already signed in on.",
          "Your device's encryption keys, kept in your browser's database (IndexedDB) on your device.",
        ],
      },
      "We don't use advertising or tracking cookies. If we add analytics later, we'll update this policy first.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep information",
    blocks: [
      {
        items: [
          {
            title: "Messages",
            text: "Until you or the sender delete them, or your account is deleted. Deleting for yourself only hides a message from you. Deleting for everyone erases the encrypted content and attachment we hold, with the removal from our storage provider done on a best-effort basis.",
          },
          {
            title: "Stories",
            text: "They expire after 24 hours and are removed from our systems within a couple of hours after that. You can delete one earlier.",
          },
          {
            title: "Sessions and devices",
            text: "Until you log out, the session expires, or you remove the device. We may keep a record that a device was logged out.",
          },
          {
            title: "Your account",
            text: "Until you ask us to delete it. We then remove your account information within 30 days, except where the law requires us to keep something. Backups may hold it a little longer.",
          },
        ],
      },
    ],
  },
  {
    id: "rights",
    title: "Your choices and rights",
    blocks: [
      "In the app you can edit your profile, see and log out your devices, switch on a passphrase, block people, and delete your messages and stories.",
      `You can also email ${SITE.contactEmail} to ask for access to your information, a copy of it, a correction, deletion of your account, or to object to how we use it. We'll reply within 30 days and may ask you to confirm it's really you.`,
      "Depending on where you live (for example the EEA, the UK or other regions with data protection laws), you may have further rights, including the right to complain to your local data protection authority.",
    ],
  },
  {
    id: "legal-basis",
    title: "Legal bases (EEA and UK)",
    blocks: [
      {
        list: [
          "Contract: to provide Relay to you.",
          "Legitimate interests: to keep Relay secure, prevent abuse and improve it, balanced against your rights.",
          "Consent: for things you opt into, such as Google sign-in permissions.",
          "Legal obligation: where the law requires us to act.",
        ],
      },
    ],
  },
  {
    id: "transfers",
    title: "Where information is processed",
    blocks: [
      "Our service providers may process information in countries other than your own. Where the law requires it, we rely on appropriate safeguards for those transfers.",
    ],
  },
  {
    id: "security",
    title: "How we protect information",
    blocks: [
      {
        list: [
          "Encryption on your device for messages and attachments, and encrypted connections (HTTPS) in transit.",
          "Passwords are hashed. Sign-in uses short-lived access tokens and rotating refresh tokens that we can revoke.",
          "Rate limits on sign-in, codes and other sensitive actions.",
          "A Devices screen so you can log out anything you don't recognise.",
        ],
      },
      "No system is perfectly secure. Keep your devices updated, use a strong password, and never share your passphrase.",
    ],
  },
  {
    id: "children",
    title: "Children",
    blocks: [
      `${SITE.name} is not for people under ${SITE.minAge}. If you believe a child has created an account, contact us and we will delete it.`,
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      "We may update this policy. We'll change the date at the top, and if the changes are significant we'll tell you in the app or by email before they take effect.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [`For anything about your privacy, write to ${SITE.contactEmail}.`],
  },
];
