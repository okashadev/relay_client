"use client";

import Link from "next/link";
import Magnetic from "@/components/marketing/Magnetic";
import { useSessionHint } from "@/hooks/useSessionHint";

export default function FinalCta() {
  const signedIn = useSessionHint();

  return (
    <section className="relative mx-3 overflow-hidden rounded-[2rem] bg-[#1D4533] px-5 py-20 text-center text-[#F7EAE0] sm:mx-6 sm:rounded-[2.75rem] sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -left-6 top-10 h-14 w-40 rounded-2xl rounded-bl-sm bg-[#F7EAE0]/10" />
        <div className="animate-drift absolute -right-8 top-1/3 h-14 w-48 rounded-2xl rounded-br-sm bg-[#F9D2BA]/15 [animation-delay:-5s]" />
        <div className="animate-drift absolute bottom-10 left-1/4 h-12 w-36 rounded-2xl rounded-bl-sm bg-[#B5654A]/25 [animation-delay:-9s]" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98] tracking-tight text-balance">
          Start a conversation.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base font-medium leading-relaxed text-[#F7EAE0]/80 sm:text-lg">
          Create an account with your email or Google. It takes about a minute.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Link
              href={signedIn ? "/app" : "/register"}
              className="inline-flex rounded-full bg-[#F9D2BA] px-8 py-4 text-sm font-bold text-[#1D4533] transition-colors hover:bg-[#F7EAE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D2BA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D4533]"
            >
              {signedIn ? "Open Relay" : "Create your account"}
            </Link>
          </Magnetic>
          {!signedIn && (
            <Link
              href="/login"
              className="rounded-full border border-[#F7EAE0]/30 px-8 py-4 text-sm font-bold transition-colors hover:bg-[#F7EAE0]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D2BA]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}