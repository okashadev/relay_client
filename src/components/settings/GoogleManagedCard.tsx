import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function GoogleManagedCard({
  what,
  detail,
}: {
  what: string;
  detail?: string;
}) {
  return (
    <div className="p-8 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm text-center space-y-3">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center">
        <ShieldCheck size={22} />
      </div>
      <p className="text-sm font-extrabold text-[#1D4533]">
        Your {what} is managed by Google
      </p>
      {detail && (
        <p className="text-xs font-bold text-[#1D4533]/80 wrap-anywhere">
          {detail}
        </p>
      )}
      <p className="text-xs font-medium text-[#5E3122]/70 leading-relaxed">
        You signed in with Google, so this can only be changed from your Google
        account.
      </p>
      <Link
        href="/settings"
        className="inline-block mt-1 px-4 py-2.5 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold shadow-md hover:bg-[#1D4533]/90 active:scale-95 transition-all"
      >
        Back to settings
      </Link>
    </div>
  );
}