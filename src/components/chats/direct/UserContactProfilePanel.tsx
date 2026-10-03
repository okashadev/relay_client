'use client';

import { 
  X, 
  Share2, 
  MessageSquare, 
  Phone, 
  Video, 
  Bell, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Sparkles,
  CheckCircle2 
} from 'lucide-react';

interface UserContactProfilePanelProps {
  onClose: () => void;
  user?: {
    name: string;
    handle: string;
    role: string;
    initials: string;
    status: 'online' | 'offline';
    statusText?: string;
    email: string;
    localTime: string;
    securityKey: string;
    about: string;
    tags: string[];
  };
}

export default function UserContactProfilePanel({
  onClose,
  user = {
    name: 'Sarah Jenkins',
    handle: '@sarah_ui',
    role: 'Product Design Lead',
    initials: 'SJ',
    status: 'online',
    statusText: 'Iterating on the 24px token spacing system & fluid chat layout specs.',
    email: 'sarah@relay.chat',
    localTime: '11:42 AM (Pacific Time)',
    securityKey: '0x9MF...77E1',
    about: 'Product Designer at Relay. Passionate about design systems, warm minimalist UI, and human-first spatial typography. Always up for UX teardowns and prototype reviews.',
    tags: ['Design Systems', 'Mutual Contact'],
  }
}: UserContactProfilePanelProps) {
  return (
    <div className="w-80 h-full bg-[#F7EAE0] border-l border-[#1D4533]/10 flex flex-col select-none overflow-y-auto shrink-0 shadow-lg">
      
      {/* Top Header */}
      <div className="p-4 border-b border-[#1D4533]/10 flex items-center justify-between bg-[#F7EAE0]/80 backdrop-blur-md sticky top-0 z-10">
        <span className="text-xs font-bold text-[#1D4533] tracking-wide">Contact Profile</span>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Banner & Avatar Section */}
      <div className="relative bg-[#F3D7C6] border-b border-[#1D4533]/10 pb-6">
        {/* Pattern / Grid Background */}
        <div className="h-20 w-full bg-[linear-gradient(to_right,#1D45330a_1px,transparent_1px),linear-gradient(to_bottom,#1D45330a_1px,transparent_1px)] bg-[size:16px_16px] relative">
          {/* Online Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-[#1D4533]/10 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-[#1D4533]">Online Now</span>
          </div>
        </div>

        {/* Avatar Box */}
        <div className="flex flex-col items-center px-4 -mt-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#1D4533] text-[#F9D2BA] font-bold text-2xl flex items-center justify-center shadow-md border-4 border-[#F7EAE0]">
              {user.initials}
            </div>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#F7EAE0]" />
          </div>

          <div className="text-center mt-3">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-sm font-bold text-[#1D4533]">{user.name}</h3>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4533] fill-[#1D4533]/20" />
            </div>
            <p className="text-[10px] text-[#5E3122]/70 font-medium mt-0.5">
              {user.handle} • {user.role}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
            {user.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-full bg-[#E8CDB9] text-[#1D4533] text-[9px] font-bold border border-[#1D4533]/5 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status / Announcement Box */}
      {user.statusText && (
        <div className="p-4">
          <div className="p-3 bg-white/70 border border-[#1D4533]/10 rounded-2xl flex items-start gap-2.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#1D4533] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#5E3122]/80 leading-relaxed font-medium">
              {user.statusText}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1D4533] text-[#F9D2BA] hover:bg-[#1D4533]/90 transition-all shadow-sm cursor-pointer group">
            <MessageSquare className="w-4 h-4 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Message</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#1D4533]/10 text-[#1D4533] hover:bg-[#1D4533]/5 transition-all shadow-sm cursor-pointer group">
            <Phone className="w-4 h-4 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Call</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#1D4533]/10 text-[#1D4533] hover:bg-[#1D4533]/5 transition-all shadow-sm cursor-pointer group">
            <Video className="w-4 h-4 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Video</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#1D4533]/10 text-[#1D4533] hover:bg-[#1D4533]/5 transition-all shadow-sm cursor-pointer group">
            <Bell className="w-4 h-4 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Alerts</span>
          </button>
        </div>
      </div>

      {/* About & Identity Section */}
      <div className="px-4 pb-6 flex-1 space-y-4">
        <div className="bg-white/80 border border-[#1D4533]/10 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1D4533] uppercase tracking-wider">About & Identity</span>
          </div>

          <p className="text-[10px] text-[#5E3122]/80 leading-relaxed font-medium">
            {user.about}
          </p>

          <div className="pt-2 border-t border-[#1D4533]/10 space-y-2.5">
            {/* Email */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2 text-[#5E3122]/70 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#1D4533]" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-[#1D4533]">
                <span>{user.email}</span>
                <Copy className="w-3 h-3 cursor-pointer hover:text-[#5E3122]" />
              </div>
            </div>

            {/* Local Time */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2 text-[#5E3122]/70 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#1D4533]" />
                <span>Local Time</span>
              </div>
              <span className="font-bold text-[#1D4533]">{user.localTime}</span>
            </div>

            {/* Security Key */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2 text-[#5E3122]/70 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1D4533]" />
                <span>ECDSA Key</span>
              </div>
              <span className="font-mono text-[9px] bg-[#1D4533]/5 px-2 py-0.5 rounded border border-[#1D4533]/10 font-bold text-[#1D4533]">
                {user.securityKey}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}