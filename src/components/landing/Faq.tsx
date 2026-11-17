"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE } from "@/lib/motion";

const FAQ = [
  { q: "Who can read my messages?", a: "Message text, captions, file names and the files themselves are encrypted on your device before they reach Relay, so our server stores them scrambled. In Standard mode Relay keeps a sealed copy of your account key so new devices can show your history, which means it could technically restore it. Turn on a passphrase and only you can." },
  { q: "What if I forget my passphrase?", a: "You can reset it from Settings. Devices that are already unlocked keep reading your history, but new devices won't get your older messages. Nobody at Relay can recover it for you." },
  { q: "Can I use Relay on more than one device?", a: "Yes. Sign in anywhere and your history is there (or after your passphrase, if you've turned one on). The Devices screen shows every device with its browser or phone model, and lets you log any of them out." },
  { q: "Why can I only start chats with friends?", a: "To keep strangers out of your inbox. Send a friend request, and once it's accepted you can message each other. Blocking someone ends the friendship and stops all messages." },
  { q: "What happens when I delete a message?", a: "Delete for me hides it from you only. Delete for everyone, within 48 hours, removes the content and any attachment for all members, and they see that it was deleted." },
  { q: "Is Relay free? Is there an app?", a: "Relay is an independent project and is free to use. It runs in your browser and is designed for phones first. A native app is planned." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-20 sm:px-8 sm:py-28">
      <h2 className="font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight text-[#1D4533] text-balance">
        Questions people ask first.
      </h2>

      <div className="mt-10 divide-y divide-[#1D4533]/12 border-y border-[#1D4533]/12">
        {FAQ.map((item, index) => {
          const isOpen = open === index;

          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${index}`}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-lg font-semibold tracking-tight text-[#1D4533] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533] sm:text-xl"
                >
                  {item.q}
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D4533]/8">
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-6 text-sm font-medium leading-relaxed text-[#5E3122]/85 sm:text-base">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}