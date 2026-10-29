"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  LogOut,
  MoreVertical,
  Pencil,
  ShieldCheck,
  ShieldOff,
  UserMinus,
  UserPlus,
  Video,
  VolumeX,
  X,
} from "lucide-react";
import AddMembersModal from "@/components/chats/group/AddMembersModal";
import EditGroupModal from "@/components/chats/group/EditGroupModal";
import MessageActionSheet, {
  type SheetAction,
} from "@/components/chats/shared/MessageActionSheet";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import GroupAvatar from "@/components/common/GroupAvatar";
import UserAvatar from "@/components/common/UserAvatar";
import type { GroupActions } from "@/hooks/useGroupActions";
import { timeAgo } from "@/lib/time";
import { usePresenceStore } from "@/store/presenceStore";
import type {
  ChatUser,
  GroupConversationDetails,
  GroupMemberItem,
  ParticipantRole,
  SharedMediaItem,
} from "@/types/chat";

interface GroupDetailsPanelProps {
  conversation: GroupConversationDetails;
  meId: string;
  sharedMedia: SharedMediaItem[];
  isMuted?: boolean;
  actions: GroupActions;
  onClose: () => void;
  onMute?: () => void;
}

const ROLE_RANK: Record<ParticipantRole, number> = {
  OWNER: 0,
  ADMIN: 1,
  MEMBER: 2,
};

const ROLE_LABEL: Partial<Record<ParticipantRole, string>> = {
  OWNER: "Owner",
  ADMIN: "Admin",
};

const mediaIcon = (type: SharedMediaItem["type"]) =>
  type === "IMAGE" ? ImageIcon : type === "VIDEO" ? Video : FileText;

export default function GroupDetailsPanel({
  conversation,
  meId,
  sharedMedia,
  isMuted = false,
  actions,
  onClose,
  onMute,
}: GroupDetailsPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [menuMember, setMenuMember] = useState<GroupMemberItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<GroupMemberItem | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const presenceByUser = usePresenceStore((state) => state.byUser);

  const myRole = conversation.myRole;
  // Group chhod chuke hon to sirf dekh sakte hain
  const isActive = conversation.canSend;
  const isAdmin = isActive && (myRole === "OWNER" || myRole === "ADMIN");

  const statusOf = (user: ChatUser) =>
    presenceByUser[user.id] ?? { status: user.status, lastSeen: user.lastSeen };

  const memberIds = useMemo(
    () => new Set(conversation.members.map((member) => member.user.id)),
    [conversation.members],
  );

  const members = useMemo(
    () =>
      [...conversation.members].sort(
        (a, b) =>
          ROLE_RANK[a.role] - ROLE_RANK[b.role] ||
          Number((presenceByUser[b.user.id]?.status ?? b.user.status) === "ONLINE") -
            Number((presenceByUser[a.user.id]?.status ?? a.user.status) === "ONLINE") ||
          a.user.name.localeCompare(b.user.name),
      ),
    [conversation.members, presenceByUser],
  );

  const createdDate = new Date(conversation.createdAt).toLocaleDateString([], {
    month: "short",
    year: "numeric",
  });

  const canRemove = (target: ParticipantRole) =>
    isActive &&
    target !== "OWNER" &&
    (myRole === "OWNER" || (myRole === "ADMIN" && target === "MEMBER"));

  const canChangeRole = (target: ParticipantRole) =>
    isActive && myRole === "OWNER" && target !== "OWNER";

  const memberActions = (member: GroupMemberItem): SheetAction[] => {
    const list: SheetAction[] = [];
    const firstName = member.user.name.split(" ")[0];

    if (canChangeRole(member.role)) {
      list.push(
        member.role === "ADMIN"
          ? {
              key: "demote",
              label: "Remove as admin",
              icon: ShieldOff,
              onSelect: () => void actions.setRole(member.user.id, "MEMBER"),
            }
          : {
              key: "promote",
              label: "Make group admin",
              icon: ShieldCheck,
              onSelect: () => void actions.setRole(member.user.id, "ADMIN"),
            },
      );
    }

    if (canRemove(member.role)) {
      list.push({
        key: "remove",
        label: `Remove ${firstName}`,
        icon: UserMinus,
        danger: true,
        onSelect: () => setRemoveTarget(member),
      });
    }

    return list;
  };

  const handleRemove = async () => {
    if (!removeTarget || busy) return;

    setBusy(true);
    const ok = await actions.remove(removeTarget.user.id);
    setBusy(false);

    if (ok) setRemoveTarget(null);
  };

  const handleLeave = async () => {
    if (busy) return;

    setBusy(true);
    const ok = await actions.leave();
    setBusy(false);

    if (ok) setLeaveOpen(false);
  };

  const gridActions = [
    isAdmin && { key: "add", label: "Add", icon: UserPlus, primary: true, onClick: () => setShowAdd(true) },
    { key: "mute", label: isMuted ? "Unmute" : "Mute", icon: VolumeX, primary: false, onClick: onMute },
    isActive && { key: "leave", label: "Leave", icon: LogOut, danger: true, primary: false, onClick: () => setLeaveOpen(true) },
  ].filter(Boolean) as {
    key: string;
    label: string;
    icon: typeof UserPlus;
    primary: boolean;
    danger?: boolean;
    onClick?: () => void;
  }[];

  return (
    <div className="w-full md:w-80 h-full bg-[#F7EAE0] md:border-l border-[#1D4533]/10 flex flex-col overflow-y-auto overscroll-contain shrink-0 shadow-lg">
      <div className="px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] border-b border-[#1D4533]/10 flex items-center justify-between bg-[#F7EAE0]/90 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xs font-bold text-[#1D4533]">Group Details</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close group details"
          className="w-9 h-9 rounded-lg hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 flex flex-col items-center text-center border-b border-[#1D4533]/10">
        <GroupAvatar
          name={conversation.name}
          avatar={conversation.avatar}
          className="w-20 h-20 rounded-3xl mb-3"
          iconClassName="w-9 h-9"
        />
        <h3 className="text-sm font-bold text-[#1D4533] max-w-full truncate">
          {conversation.name}
        </h3>
        <p className="text-[10px] text-[#5E3122]/60 font-medium max-w-full truncate">
          {conversation.createdBy
            ? `Created by ${conversation.createdBy.name} • ${createdDate}`
            : `Created ${createdDate}`}
        </p>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="mt-3 px-3.5 h-8 rounded-full bg-white border border-[#1D4533]/15 text-[#1D4533] text-[11px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#1D4533]/5 active:scale-95 transition-all cursor-pointer"
          >
            <Pencil size={12} /> Edit group
          </button>
        )}

        {!isActive && (
          <p className="mt-3 px-3 py-1.5 rounded-full bg-[#1D4533]/10 text-[10px] font-bold text-[#1D4533]">
            You&apos;re no longer in this group
          </p>
        )}

        <div className="mt-4 p-3 bg-white/70 border border-[#1D4533]/10 rounded-xl text-left w-full">
          <p className="text-[9px] font-bold text-[#1D4533] uppercase tracking-wider mb-1">
            About
          </p>
          <p className="text-[10px] text-[#5E3122]/80 leading-relaxed font-medium wrap-anywhere whitespace-pre-wrap">
            {conversation.description || "No description yet."}
          </p>
        </div>

        <div
          className="grid gap-2 w-full mt-4"
          style={{ gridTemplateColumns: `repeat(${gridActions.length}, minmax(0, 1fr))` }}
        >
          {gridActions.map(({ key, label, icon: Icon, primary, danger, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-colors cursor-pointer ${
                primary
                  ? "bg-[#1D4533] text-[#F9D2BA] hover:bg-[#1D4533]/90"
                  : `bg-white border border-[#1D4533]/10 hover:bg-[#1D4533]/5 ${
                      danger ? "text-rose-600 hover:bg-rose-50" : "text-[#1D4533]"
                    }`
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {sharedMedia.length > 0 && (
        <div className="p-4 border-b border-[#1D4533]/10">
          <span className="block mb-3 text-[10px] font-bold text-[#1D4533] tracking-wide uppercase">
            Shared media ({sharedMedia.length})
          </span>

          <div className="grid grid-cols-3 gap-2">
            {sharedMedia.slice(0, 3).map((item) => {
              const Icon = mediaIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="h-16 rounded-xl bg-white border border-[#1D4533]/10 flex flex-col items-center justify-center p-2"
                >
                  <Icon className="w-5 h-5 text-[#1D4533]" />
                  <span className="text-[8px] font-medium text-[#5E3122] truncate w-full text-center mt-1">
                    {item.fileName ?? item.type.toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 flex-1">
        <span className="block mb-3 text-[10px] font-bold text-[#1D4533] tracking-wide uppercase">
          Members ({conversation.members.length})
        </span>

        <ul className="space-y-1">
          {members.map((member) => {
            const { user, role } = member;
            const live = statusOf(user);
            const isOnline = live.status === "ONLINE";
            const roleLabel = ROLE_LABEL[role];
            const hasMenu =
              user.id !== meId && (canRemove(role) || canChangeRole(role));

            return (
              <li
                key={user.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <UserAvatar
                      name={user.name}
                      avatar={user.avatar}
                      className="w-8 h-8 rounded-xl"
                      textClassName="text-[10px]"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#F7EAE0] ${
                        isOnline ? "bg-emerald-500" : "bg-[#1D4533]/30"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1D4533] truncate">
                      {user.name}
                      {user.id === meId && (
                        <span className="ml-1 text-[9px] font-medium text-[#5E3122]/50">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-[9px] text-[#5E3122]/60 font-medium truncate">
                      @{user.username}
                      {!isOnline && live.lastSeen && ` • ${timeAgo(live.lastSeen)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {roleLabel && (
                    <span className="px-2 py-0.5 rounded-md bg-[#1D4533] text-[#F9D2BA] text-[8px] font-bold">
                      {roleLabel}
                    </span>
                  )}
                  {hasMenu && (
                    <button
                      type="button"
                      onClick={() => setMenuMember(member)}
                      aria-label={`Options for ${user.name}`}
                      aria-haspopup="dialog"
                      className="w-8 h-8 rounded-lg text-[#1D4533]/60 hover:bg-[#1D4533]/10 hover:text-[#1D4533] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {showAdd && (
        <AddMembersModal
          memberIds={memberIds}
          onClose={() => setShowAdd(false)}
          onAdd={actions.add}
        />
      )}

      {showEdit && (
        <EditGroupModal
          group={conversation}
          onClose={() => setShowEdit(false)}
          onSave={actions.update}
        />
      )}

      {menuMember && (
        <MessageActionSheet
          onClose={() => setMenuMember(null)}
          myReaction={null}
          actions={memberActions(menuMember)}
        />
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        title={`Remove ${removeTarget?.user.name ?? "member"}?`}
        description="They'll be removed from the group, and can still read the messages sent before they were removed. You can add them back later."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isLoading={busy}
        onConfirm={() => void handleRemove()}
        onClose={() => {
          if (!busy) setRemoveTarget(null);
        }}
      />

      <ConfirmDialog
        open={leaveOpen}
        title="Leave this group?"
        description={
          myRole === "OWNER"
            ? "You're the owner. Ownership will pass to the longest-standing admin (or member). You'll stop receiving messages from this group."
            : "You'll stop receiving messages from this group. An admin can add you back."
        }
        confirmLabel="Leave group"
        cancelLabel="Stay"
        isLoading={busy}
        onConfirm={() => void handleLeave()}
        onClose={() => {
          if (!busy) setLeaveOpen(false);
        }}
      />
    </div>
  );
}