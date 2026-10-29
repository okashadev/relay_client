import type { Relationship } from "@/types/friends";
import { Check, Clock, Loader2, UserCheck, UserPlus, X } from "lucide-react";

const BASE =
  "h-10 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";

export default function RelationshipAction({
  relationship,
  isSending,
  isActing,
  onAdd,
  onCancel,
  onAccept,
  onReject,
}: {
  relationship: Relationship;
  isSending: boolean;
  isActing: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  switch (relationship) {
    case "NONE":
      return (
        <button
          type="button"
          onClick={onAdd}
          disabled={isSending}
          className={`${BASE} min-w-28 px-4 shadow-sm bg-[#1D4533] text-[#F7EAE0] hover:bg-[#1D4533]/90`}
        >
          {isSending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <UserPlus size={14} /> Add Friend
            </>
          )}
        </button>
      );

    case "REQUEST_SENT":
      return (
        <button
          type="button"
          onClick={onCancel}
          aria-haspopup="dialog"
          aria-label="Requested. Click to cancel friend request"
          title="Click to cancel request"
          className={`${BASE} px-4 bg-white text-[#1D4533] border border-[#1D4533]/25 hover:bg-[#1D4533]/5`}
        >
          <Clock size={14} /> Requested
        </button>
      );

    case "REQUEST_RECEIVED":
      return (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAccept}
            disabled={isActing}
            title="Accept request"
            aria-label="Accept friend request"
            className={`${BASE} w-10 sm:w-auto sm:px-4 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            {isActing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Check size={14} />
                <span className="hidden sm:inline">Accept</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isActing}
            title="Reject request"
            aria-label="Reject friend request"
            className={`${BASE} w-10 shadow-sm bg-rose-500 text-white hover:bg-rose-600`}
          >
            <X size={14} />
          </button>
        </div>
      );

    case "FRIENDS":
      return (
        <span className="h-10 px-4 rounded-2xl bg-[#1D4533]/10 text-[#1D4533] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
          <UserCheck size={14} /> Friends
        </span>
      );

    default:
      return null;
  }
}
