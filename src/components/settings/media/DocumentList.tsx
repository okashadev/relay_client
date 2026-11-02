"use client";

import { useMemo } from "react";
import { Download, FileText, MoreVertical } from "lucide-react";
import { formatFileSize } from "@/lib/format";
import {
  extensionOf,
  formatShortDate,
  groupByMonth,
  senderLabel,
} from "@/lib/mediaGallery";
import type { MediaItem } from "@/types/media";

export default function DocumentList({
  items,
  meId,
  showChat,
  onDownload,
  onMenu,
}: {
  items: MediaItem[];
  meId: string;
  showChat: boolean;
  onDownload: (item: MediaItem) => void;
  onMenu: (item: MediaItem) => void;
}) {
  const groups = useMemo(() => groupByMonth(items), [items]);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-2">
            {group.label}
          </h3>

          <ul className="space-y-2">
            {group.items.map((item) => {
              const who = senderLabel(item, meId);
              const name = item.fileName ?? "Document";

              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-white border border-[#1D4533]/15 rounded-2xl shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#1D4533]/10 text-[#1D4533] flex flex-col items-center justify-center shrink-0">
                    <FileText size={16} />
                    <span className="mt-0.5 text-[8px] font-black leading-none">
                      {extensionOf(item.fileName)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1D4533] truncate">
                      {name}
                    </p>
                    <p className="text-[11px] font-medium text-[#5E3122]/70 truncate">
                      {formatFileSize(item.mediaSize)} •{" "}
                      {formatShortDate(item.createdAt)}
                    </p>
                    <p className="text-[10px] font-medium text-[#5E3122]/50 truncate">
                      {showChat ? `${who} • ${item.conversationName}` : who}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDownload(item)}
                      aria-label={`Download ${name}`}
                      title="Download"
                      className="w-10 h-10 rounded-xl text-[#1D4533] hover:bg-[#1D4533]/10 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMenu(item)}
                      aria-label={`Options for ${name}`}
                      aria-haspopup="dialog"
                      title="More"
                      className="w-10 h-10 rounded-xl text-[#1D4533]/60 hover:bg-[#1D4533]/10 hover:text-[#1D4533] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}