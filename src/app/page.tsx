"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  MessageSquare,
  Clock,
  CheckCheck,
  Send,
  ArrowRight,
  Users,
  Sparkles,
  Server,
} from "lucide-react";

interface DemoMessage {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
  status?: "sent" | "read";
}

export default function Home() {
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      id: 1,
      sender: "them",
      text: "Hey! Relay ka backend Alwaysdata par live ho gaya hai 🚀",
      time: "10:12 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Zabardast! End-to-end encryption aur Socket.IO sync bilkul smooth chal rahe hain.",
      time: "10:13 AM",
      status: "read",
    },
  ]);

  // Live Health Check from your Alwaysdata Backend
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(
          "https://zoforge-relay.alwaysdata.net/api/health",
        );
        if (res.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      } catch {
        setServerStatus("offline");
      }
    };
    checkHealth();
  }, []);

  const handleSendDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: DemoMessage = {
      id: Date.now(),
      sender: "me",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "read",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-indigo-600/15 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Relay
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Live Preview
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>End-to-End Encrypted Real-Time Messaging</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Private conversations,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
                  delivered instantly.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Relay connects you with your circle through zero-latency
                WebSockets, strict friends-only privacy, and disappearing
                24-hour stories—built for speed and true privacy.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                >
                  Open Relay Web <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm transition-all text-center"
                >
                  Explore Architecture
                </a>
              </div>

              {/* Live API Status Pill */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      serverStatus === "online"
                        ? "bg-emerald-400 animate-pulse"
                        : serverStatus === "checking"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-rose-500"
                    }`}
                  />
                  <span>
                    Relay Engine:{" "}
                    <strong className="text-zinc-200 font-medium">
                      {serverStatus === "online"
                        ? "Operational"
                        : serverStatus === "checking"
                          ? "Connecting..."
                          : "Offline"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Interactive Chat Mockup */}
            <div id="demo" className="lg:col-span-6">
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                        ZF
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-white">
                          Zoforge Dev
                        </h3>
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-xs text-emerald-400">
                        Online • E2EE Active
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    Interactive Demo
                  </span>
                </div>

                {/* Chat Body */}
                <div className="p-4 h-72 overflow-y-auto space-y-3 bg-[#0c0c0f]/60">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Messages are end-to-end encrypted
                    </span>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        msg.sender === "me"
                          ? "ml-auto items-end"
                          : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === "me"
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-zinc-500">
                        <span>{msg.time}</span>
                        {msg.sender === "me" && (
                          <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={handleSendDemo}
                  className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type an encrypted test message..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    aria-label="Send demo message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section
          id="features"
          className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-zinc-800/70"
        >
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Engineered for modern communication
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Every layer of Relay is built to eliminate noise and protect your
              digital footprint.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                End-to-End Encryption
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Dedicated key escrow and client-side encryption ensure only you
                and your recipient can read your chats.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Real-Time Socket Sync
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Instant typing indicators, live presence tracking, and delivery
                receipts powered by persistent WebSockets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Auto-Purging Stories
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Share moments with your friends that automatically purge from
                servers after 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Friends-Only Circle
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                No spam or random DMs. Conversations and presence updates happen
                strictly within your approved connections.
              </p>
            </div>

            <div
              id="security"
              className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-indigo-950/20 border border-zinc-800/90 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400">
                  <Server className="w-4 h-4" />
                  <span>Hardened Authentication Stack</span>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Argon2id Hashing & Token Rotation
                </h3>
                <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Built with memory-hard Argon2id password protection, HTTP-only
                  refresh token rotation, Google OAuth, and strict rate
                  limiting.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Argon2id",
                  "E2EE",
                  "Socket.IO",
                  "JWT Rotation",
                  "Rate Limited",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-10 bg-zinc-950/60 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">Relay</span>
            <span>•</span>
            <span>Powered by Zoforge</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hover:text-zinc-300 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hover:text-zinc-300 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
