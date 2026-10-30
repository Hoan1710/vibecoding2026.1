"use client";

import { useState } from "react";
import Header from "@/components/shared/Header";
import ChatWindow from "@/components/chat/ChatWindow";
import HelpSidebar from "@/components/chat/HelpSidebar";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handleSelectFaqPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    // Reset after trigger so it can re-trigger if needed
    setTimeout(() => setSelectedPrompt(null), 300);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f9fb] text-[#191c1e]">
      {/* Screen 1 Header */}
      <Header role="client" />

      {/* Main Workspace: Asymmetric 12-Column Grid */}
      <main className="w-full flex-1 min-h-0 flex flex-col overflow-hidden relative">
        <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 flex-1 min-h-0 items-stretch">
            {/* Left/Center Column: Chat Window (8 cols when sidebar open, 12 cols when hidden) */}
            <div
              className={`flex flex-col h-full min-h-0 transition-all duration-300 ${
                sidebarOpen ? "lg:col-span-8" : "lg:col-span-12"
              }`}
            >
              <ChatWindow
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                externalPrompt={selectedPrompt}
              />
            </div>

            {/* Right Column: Help Sidebar (4 cols on desktop, hidden when toggled) */}
            {sidebarOpen && (
              <div className="hidden lg:flex lg:col-span-4 flex-col h-full min-h-0 overflow-hidden">
                <HelpSidebar
                  onSelectQuestion={handleSelectFaqPrompt}
                  onToggleHide={() => setSidebarOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile to view Help/Taskbar */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 rounded-full bg-[#4f46e5] text-white shadow-lg flex items-center justify-center gap-1.5 font-bold text-xs"
        >
          <span className="material-symbols-outlined text-[20px]">
            {sidebarOpen ? "chat" : "help"}
          </span>
          <span>{sidebarOpen ? "Về Chat" : "Trợ giúp & FAQ"}</span>
        </button>
      </div>

      {/* Mobile Drawer if opened */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-h-[85vh] overflow-y-auto p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Taskbar Trợ Giúp & FAQ</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <HelpSidebar
              onSelectQuestion={(q) => {
                handleSelectFaqPrompt(q);
                setSidebarOpen(false);
              }}
              onToggleHide={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
