'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, UserCheck, ArrowLeft } from 'lucide-react';

const SUGGESTIONS = [
  { id: 's1', name: 'Daniyal Ahmed', role: 'Fullstack Dev', avatar: 'DA', mutual: 8 },
  { id: 's2', name: 'Ayesha Omer', role: 'Data Scientist', avatar: 'AO', mutual: 2 },
  { id: 's3', name: 'Bilal Khan', role: 'DevOps Engineer', avatar: 'BK', mutual: 4 },
];

interface AddFriendScreenProps {
  onBack: () => void;
}

export default function AddFriendScreen({ onBack }: AddFriendScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const handleSendRequest = (id: string) => {
    setSentRequests((prev) => [...prev, id]);
  };

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col h-full min-w-0 p-6 lg:p-8 overflow-y-auto bg-[#F7EAE0]"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#1D4533]/10">
        <button
          onClick={onBack}
          className="p-2.5 bg-white border border-[#1D4533]/15 rounded-2xl text-[#1D4533] hover:bg-[#1D4533]/5 transition-all shadow-sm cursor-pointer flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft size={16} />
          <span>Back to Friends</span>
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-[#1D4533] tracking-tight">Add New Friends</h1>
          <p className="text-xs text-[#1D4533]/70 font-medium">Discover and connect with developers across the network.</p>
        </div>
      </div>

      {/* Search & Suggestions Content */}
      <div className="py-6 max-w-2xl w-full space-y-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4533]/50" />
          <input
            type="text"
            placeholder="Search people across network by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/90 border border-[#1D4533]/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-2 focus:ring-[#1D4533]/30 shadow-sm font-medium"
          />
        </div>

        <div>
          <h3 className="text-xs font-extrabold text-[#1D4533]/70 uppercase tracking-wider mb-4">
            Suggested For You ({filteredSuggestions.length})
          </h3>
          <div className="space-y-3">
            {filteredSuggestions.map((s) => {
              const isSent = sentRequests.includes(s.id);
              return (
                <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center font-bold text-sm shadow">
                      {s.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1D4533]">{s.name}</h4>
                      <p className="text-[11px] text-[#1D4533]/70 font-medium">{s.role} • {s.mutual} mutual connections</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(s.id)}
                    disabled={isSent}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      isSent
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#1D4533] text-[#F7EAE0] hover:bg-[#1D4533]/90'
                    }`}
                  >
                    {isSent ? <><UserCheck size={14} /> Requested</> : <><UserPlus size={14} /> Add Friend</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}