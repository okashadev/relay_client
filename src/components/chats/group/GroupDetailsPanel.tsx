'use client';

import React from 'react';
import { X, Users, UserPlus, VolumeX, LogOut, FileText, BarChart2, Image } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  role?: string;
  initials: string;
  tag?: string;
  status: 'online' | 'offline';
  isYou?: boolean;
}

const members: Member[] = [
  { id: '1', name: 'Marcus Brody', role: 'Sprint Leader', initials: 'MB', tag: 'Admin', status: 'online' },
  { id: '2', name: 'Okasha Khan', role: 'Lead Architect', initials: 'OK', status: 'online' },
  { id: '3', name: 'Sarah Jenkins', role: 'Design Lead', initials: 'SJ', status: 'online' },
  { id: '4', name: 'Alex Morgan', role: 'Mobile Eng', initials: 'AM', status: 'online', isYou: true },
  { id: '5', name: 'David Chen', role: 'DevOps • 2h ago', initials: 'DC', status: 'offline' },
];

export default function GroupDetailsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-80 h-full bg-[#F7EAE0] border-l border-[#1D4533]/10 flex flex-col select-none overflow-y-auto shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[#1D4533]/10 flex items-center justify-between">
        <h2 className="text-xs font-bold text-[#1D4533]">Group Details</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1D4533]/10 text-[#1D4533] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Group Summary Card */}
      <div className="p-6 flex flex-col items-center text-center border-b border-[#1D4533]/10">
        <div className="w-16 h-16 rounded-2xl bg-[#1D4533] text-[#F9D2BA] flex items-center justify-center text-2xl font-bold shadow-md mb-3">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-[#1D4533]">Product Sprint Team</h3>
        <p className="text-[10px] text-[#5E3122]/60 font-medium">Created by Marcus • Aug 2024</p>

        {/* About Box */}
        <div className="mt-4 p-3 bg-white/70 border border-[#1D4533]/10 rounded-xl text-left w-full">
          <p className="text-[9px] font-bold text-[#1D4533] uppercase tracking-wider mb-1">About</p>
          <p className="text-[10px] text-[#5E3122]/80 leading-relaxed font-medium">
            Official team collaboration group for synchronous cluster operations and project planning.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 w-full mt-4">
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1D4533] text-[#F9D2BA] hover:bg-[#1D4533]/90 transition-colors">
            <UserPlus className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold">Add</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#1D4533]/10 text-[#1D4533] hover:bg-[#1D4533]/5 transition-colors">
            <VolumeX className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold">Mute</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#1D4533]/10 text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold">Leave</span>
          </button>
        </div>
      </div>

      {/* Shared Media */}
      <div className="p-4 border-b border-[#1D4533]/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[#1D4533] tracking-wide">SHARED MEDIA (24)</span>
          <button className="text-[9px] font-bold text-[#5E3122]/60 hover:text-[#1D4533]">View All</button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 rounded-xl bg-white border border-[#1D4533]/10 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-[#1D4533] transition-colors">
            <BarChart2 className="w-5 h-5 text-[#1D4533]" />
            <span className="text-[8px] font-medium text-[#5E3122] truncate w-full text-center mt-1">topology.svg</span>
          </div>
          <div className="h-16 rounded-xl bg-white border border-[#1D4533]/10 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-[#1D4533] transition-colors">
            <FileText className="w-5 h-5 text-[#1D4533]" />
            <span className="text-[8px] font-medium text-[#5E3122] truncate w-full text-center mt-1">benchmarks....</span>
          </div>
          <div className="h-16 rounded-xl bg-white border border-[#1D4533]/10 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-[#1D4533] transition-colors">
            <Image className="w-5 h-5 text-[#1D4533]" />
            <span className="text-[8px] font-medium text-[#5E3122] truncate w-full text-center mt-1">wireframe.png</span>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[#1D4533] tracking-wide">GROUP MEMBERS (12)</span>
          <span className="text-[9px] font-bold text-emerald-600">4 online</span>
        </div>

        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-[#1D4533] text-[#F9D2BA] font-bold text-[10px] flex items-center justify-center">
                    {member.initials}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#F7EAE0] ${
                      member.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-[#1D4533]">{member.name}</p>
                    {member.isYou && <span className="text-[9px] font-medium text-[#5E3122]/50">(You)</span>}
                  </div>
                  <p className="text-[9px] text-[#5E3122]/60 font-medium">{member.role}</p>
                </div>
              </div>

              {member.tag && (
                <span className="px-2 py-0.5 rounded-md bg-[#1D4533] text-[#F9D2BA] text-[8px] font-bold">
                  {member.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}