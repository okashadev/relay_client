import { type Relationship } from "@/lib/friendsApi";
import { Check, Loader2, MessageCircle, UserCheck, UserPlus, X } from "lucide-react";

type FriendStatus = "PENDING" | "ACCEPTED" | "BLOCKED";

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
          className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer bg-[#1D4533] text-[#F7EAE0] hover:bg-[#1D4533]/90 disabled:opacity-70 disabled:cursor-not-allowed"
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
          className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <UserCheck size={14} /> Requested
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
            className="p-2.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isActing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isActing}
            title="Reject request"
            aria-label="Reject friend request"
            className="p-2.5 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <X size={14} />
          </button>
        </div>
      );

    case "FRIENDS":
      return (
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-bold">
          <MessageCircle />
        </span>
      );
  }
}
