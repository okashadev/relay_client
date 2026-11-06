"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  Download,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import DeleteMessageDialog from "@/components/chats/shared/DeleteMessageDialog";
import MessageActionSheet, {
  type SheetAction,
} from "@/components/chats/shared/MessageActionSheet";
import DocumentList from "@/components/settings/media/DocumentList";
import MediaGrid from "@/components/settings/media/MediaGrid";
import StorageMediaViewer from "@/components/settings/media/StorageMediaViewer";
import SettingsShell from "@/components/settings/SettingsShell";
import type { DeleteDialogConfig } from "@/hooks/useChatSession";
import { useMediaFeed } from "@/hooks/useMediaFeed";
import { useMediaSummary } from "@/hooks/useMediaSummary";
import { deleteMessage } from "@/lib/api/ChatApi";
import { downloadFile } from "@/lib/chat/downloadFile";
import { formatFileSize } from "@/lib/format";
import { downloadName } from "@/lib/mediaGallery";
import { DELETE_EVERYONE_WINDOW_MS } from "@/lib/chat/messageRules";
import { useAuthStore } from "@/store/authStore";
import { useChatListStore } from "@/store/chatListStore";
import type { MediaItem } from "@/types/media";
import { downloadDecrypted } from "@/lib/e2ee/media";

type Tab = "MEDIA" | "DOCS";

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="p-8 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center space-y-3">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-extrabold text-[#1D4533]">{title}</p>
        <p className="text-xs font-medium text-[#5E3122]/70 mt-0.5">{text}</p>
      </div>
    </div>
  );
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="underline shrink-0 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

function FeedSkeleton({ docs }: { docs: boolean }) {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse">
      {docs ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-17 rounded-2xl bg-[#1D4533]/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg sm:rounded-xl bg-[#1D4533]/10"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MediaSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const reduceMotion = useReducedMotion() ?? false;
  const meId = user?.id ?? "";

  const [tab, setTab] = useState<Tab>("MEDIA");
  const [scope, setScope] = useState("all");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [menuItem, setMenuItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const summary = useMediaSummary();
  const chats = summary.chats ?? [];

  const activeScope = chats.some((chat) => chat.id === scope) ? scope : "all";
  const feed = useMediaFeed(
    tab === "MEDIA" ? "media" : "files",
    activeScope === "all" ? null : activeScope,
  );

  const scoped =
    activeScope === "all"
      ? chats
      : chats.filter((chat) => chat.id === activeScope);
  const visualCount = scoped.reduce((sum, chat) => sum + chat.visual, 0);
  const filesCount = scoped.reduce((sum, chat) => sum + chat.files, 0);
  const totalBytes = scoped.reduce((sum, chat) => sum + chat.bytes, 0);
  const scopeName =
    activeScope === "all"
      ? "all chats"
      : (chats.find((chat) => chat.id === activeScope)?.name ?? "this chat");

  const handleDownload = (item: MediaItem) => {
    downloadDecrypted(item, downloadName(item))
      .then(() => toast.success("Download started."))
      .catch((error) => toast.error(error.message));
  };

  const showInChat = (item: MediaItem) =>
    router.push(`/app/${item.conversationId}`);

  const menuActions = (item: MediaItem): SheetAction[] => [
    {
      key: "download",
      label: "Download",
      icon: Download,
      onSelect: () => handleDownload(item),
    },
    {
      key: "chat",
      label: "Show in chat",
      icon: MessageSquare,
      onSelect: () => showInChat(item),
    },
    {
      key: "delete",
      label: "Delete",
      icon: Trash2,
      danger: true,
      onSelect: () => setDeleteTarget(item),
    },
  ];

  const deleteDialog: DeleteDialogConfig | null = deleteTarget
    ? {
        canDeleteEveryone:
          deleteTarget.senderId === meId &&
          Date.now() - Date.parse(deleteTarget.createdAt) <=
            DELETE_EVERYONE_WINDOW_MS,
        onClose: () => setDeleteTarget(null),
        onConfirm: async (choice) => {
          try {
            await deleteMessage(
              deleteTarget.conversationId,
              deleteTarget.id,
              choice,
            );

            feed.remove(deleteTarget.id);
            summary.reload();
            useChatListStore.getState().invalidate();

            toast.success(
              choice === "everyone"
                ? "Deleted for everyone."
                : "Deleted for you.",
            );
            setDeleteTarget(null);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Couldn't delete this item.",
            );
          }
        },
      }
    : null;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "MEDIA", label: "Photos & videos", count: visualCount },
    { key: "DOCS", label: "Documents", count: filesCount },
  ];

  return (
    <SettingsShell
      title="Media & storage"
      subtitle="Everything shared in your chats"
      backHref="/settings"
      maxWidth="max-w-3xl"
    >
      {summary.error && (
        <div className="mb-4">
          <ErrorBox message={summary.error} onRetry={summary.reload} />
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-3.5 p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center shrink-0 shadow-md shadow-[#1D4533]/15">
          <HardDrive size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-black text-[#1D4533] tracking-tight leading-tight">
            {summary.chats === null ? "…" : formatFileSize(totalBytes)}
          </p>
          <p className="text-[11px] font-medium text-[#5E3122]/70 truncate">
            {visualCount + filesCount}{" "}
            {visualCount + filesCount === 1 ? "item" : "items"} in {scopeName}
          </p>
        </div>
      </div>

      {/* Chat filter */}
      <div className="relative mt-4">
        <select
          aria-label="Filter by chat"
          value={activeScope}
          onChange={(event) => setScope(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-[#1D4533]/15 bg-white pl-4 pr-10 py-3 text-base md:text-xs font-bold text-[#1D4533] shadow-sm outline-none cursor-pointer transition-all focus:border-[#1D4533] focus:ring-4 focus:ring-[#1D4533]/10"
        >
          <option value="all">All chats</option>
          <optgroup label="Groups">
            {chats
              .filter((chat) => chat.type === "GROUP")
              .map((chat) => (
                <option key={chat.id} value={chat.id}>
                  {chat.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Direct chats">
            {chats
              .filter((chat) => chat.type === "DIRECT")
              .map((chat) => (
                <option key={chat.id} value={chat.id}>
                  {chat.name}
                </option>
              ))}
          </optgroup>
        </select>
        <ChevronDown
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1D4533]/60 pointer-events-none"
        />
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Media type"
        className="mt-3 p-1 rounded-2xl bg-[#1D4533]/5 grid grid-cols-2 gap-1"
      >
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              tab === key
                ? "bg-[#1D4533] text-[#F7EAE0] shadow-sm"
                : "text-[#1D4533]/70 hover:bg-[#1D4533]/5"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={`${tab}-${activeScope}`}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="mt-5"
      >
        {feed.isLoading && <FeedSkeleton docs={tab === "DOCS"} />}

        {feed.error && <ErrorBox message={feed.error} onRetry={feed.reload} />}

        {!feed.isLoading &&
          !feed.error &&
          feed.items.length === 0 &&
          (tab === "MEDIA" ? (
            <EmptyState
              icon={ImageIcon}
              title="No photos or videos"
              text="Photos and videos shared in your chats show up here."
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents"
              text="Files shared in your chats show up here."
            />
          ))}

        {feed.items.length > 0 &&
          (tab === "MEDIA" ? (
            <MediaGrid items={feed.items} meId={meId} onOpen={setViewerIndex} />
          ) : (
            <DocumentList
              items={feed.items}
              meId={meId}
              showChat={activeScope === "all"}
              onDownload={handleDownload}
              onMenu={setMenuItem}
            />
          ))}

        {feed.hasMore && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => void feed.loadMore()}
              disabled={feed.loadingMore}
              className="px-5 py-2.5 rounded-full bg-white border border-[#1D4533]/15 text-[#1D4533] text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer hover:bg-[#1D4533]/5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {feed.loadingMore && (
                <Loader2 size={13} className="animate-spin" />
              )}
              Load more
            </button>
          </div>
        )}
      </motion.div>

      {viewerIndex !== null && (
        <StorageMediaViewer
          items={feed.items}
          startIndex={viewerIndex}
          meId={meId}
          paused={deleteTarget !== null}
          onClose={() => setViewerIndex(null)}
          onDownload={handleDownload}
          onDelete={setDeleteTarget}
          onShowInChat={showInChat}
        />
      )}

      {menuItem && (
        <MessageActionSheet
          onClose={() => setMenuItem(null)}
          myReaction={null}
          actions={menuActions(menuItem)}
        />
      )}

      {deleteDialog && <DeleteMessageDialog {...deleteDialog} />}
    </SettingsShell>
  );
}
