import { SITE } from "@/lib/site";
import type { LegalSection } from "./types";

export const TERMS_INTRO =
  "These terms are the agreement between you and Relay. Please read them before you use the app.";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    blocks: [
      `By creating an account or using ${SITE.name}, you agree to these Terms of Service and to our Privacy Policy. If you don't agree, please don't use ${SITE.name}.`,
      `You must be at least ${SITE.minAge} years old. If you're under the age of majority where you live, you need a parent or guardian's permission, and they accept these terms for you.`,
    ],
  },
  {
    id: "account",
    title: "Your account",
    blocks: [
      {
        list: [
          "Give accurate information and keep it up to date.",
          "Keep your password and passphrase safe. You're responsible for what happens under your account.",
          "Tell us straight away if you think someone else has access to your account.",
          "Use the Devices screen to log out any device you don't recognise.",
        ],
      },
      "You can sign in with email and password, or with Google. We may ask you to verify your email address before you can use Relay.",
    ],
  },
  {
    id: "using-relay",
    title: "Using Relay",
    blocks: [
      "You can start a chat with people who have accepted your friend request. Anyone can block you or end a friendship at any time.",
      "You agree not to:",
      {
        list: [
          "break the law, or help someone else break it;",
          "harass, threaten, abuse or impersonate anyone, or share someone's private information without permission;",
          "share sexual content involving minors, or any content that exploits or endangers children. We have zero tolerance for this and will report it where the law requires;",
          "send spam, scams, malware or anything meant to harm devices or accounts;",
          "scrape Relay, overload it, bypass rate limits or other protections, or access accounts that aren't yours;",
          "probe for security problems without permission. If you find one, please tell us and give us time to fix it.",
        ],
      },
    ],
  },
  {
    id: "content",
    title: "Your content",
    blocks: [
      "You own what you create and share on Relay. You're responsible for it, and for having the right to share it.",
      "To run Relay, you give us a limited, non-exclusive licence to store, transmit and display your content, only as needed to provide the service. For example, to deliver a message to your friend, show your story to the people who can see it, and keep a copy for your own history. This licence ends when you delete the content or your account, apart from short delays in backups.",
      "Your messages and attachments are encrypted on your device, which means we generally can't see them.",
    ],
  },
  {
    id: "stories",
    title: "Stories",
    blocks: [
      "Stories are visible to your friends for 24 hours and are then removed. Anyone who saw a story can screenshot or save it, so we can't promise that it disappears from other people's devices.",
    ],
  },
  {
    id: "encryption",
    title: "Encryption and your passphrase",
    blocks: [
      "Relay encrypts your messages on your device. In Standard mode, new devices can restore your history automatically, which also means we could technically restore it. In Private mode, only your passphrase can restore your history on a new device.",
      {
        callout:
          "If you turn on a passphrase and forget it, we can't recover it. Resetting it means new devices won't get your older messages. That's your responsibility to keep in mind.",
      },
      "Relay is an independent project and hasn't had an independent security audit. No system is perfectly secure, so please don't rely on Relay for situations where a failure could put someone's safety at risk.",
    ],
  },
  {
    id: "moderation",
    title: "Blocking, reports and moderation",
    blocks: [
      `You can block anyone from inside the app. If someone breaks these terms, write to ${SITE.contactEmail} with as much detail as you can.`,
      "Because messages are encrypted, we can't review their content ourselves. We can act on things we can see, such as profiles, stories, group details, account behaviour and reports, by removing content or suspending accounts.",
    ],
  },
  {
    id: "availability",
    title: "Changes and availability",
    blocks: [
      `${SITE.name} is still being built. Features and limits (such as group size, edit and delete time windows and the number of devices) may change, and the service may have downtime or be interrupted. We'll try to tell you about important changes in advance.`,
    ],
  },
  {
    id: "termination",
    title: "Ending your use of Relay",
    blocks: [
      `You can stop using ${SITE.name} at any time. To delete your account, email ${SITE.contactEmail}.`,
      "We may suspend or end your access if you break these terms, if we need to protect others or the service, or if the law requires it. Where we reasonably can, we'll tell you why.",
    ],
  },
  {
    id: "disclaimers",
    title: "No warranties",
    blocks: [
      `${SITE.name} is provided "as is" and "as available". To the fullest extent the law allows, we don't promise that it will be uninterrupted, error-free or secure, or that messages will always be delivered.`,
    ],
  },
  {
    id: "liability",
    title: "Limit of liability",
    blocks: [
      "To the fullest extent the law allows, we are not liable for indirect or consequential losses, lost data, or loss of profits or goodwill arising from your use of Relay.",
      "Our total liability for any claim is limited to the amount you paid to use Relay in the 12 months before the claim, which for a free service may be zero. Nothing in these terms limits liability that the law doesn't allow us to limit.",
    ],
  },
  {
    id: "ip",
    title: "Our property",
    blocks: [
      `The ${SITE.name} name, logo, design and software belong to us or our licensors. These terms don't give you any rights to them, other than to use the service. If you send us feedback, we may use it freely.`,
    ],
  },
  {
    id: "law",
    title: "Governing law",
    blocks: [
      `These terms are governed by the laws of ${SITE.jurisdiction}, and courts there have jurisdiction over any dispute, unless the law where you live gives you rights that can't be waived. Before taking formal action, please contact us at ${SITE.contactEmail} so we can try to sort it out.`,
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    blocks: [
      "We may update these terms. We'll change the date at the top, and tell you in the app or by email about significant changes before they take effect. If you keep using Relay after that, you accept the updated terms.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [`Questions about these terms? Write to ${SITE.contactEmail}.`],
  },
];
