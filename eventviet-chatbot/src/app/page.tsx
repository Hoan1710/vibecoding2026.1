"use client";

import { useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";

export default function HomePage() {
  const [externalBooking, setExternalBooking] = useState<{
    eventType: string;
    timestamp: number;
  } | null>(null);

  const handleSelectPackage = (eventType: string) => {
    setExternalBooking({
      eventType,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#080C14] text-slate-100 ambient-glow overflow-hidden">
      {/* Global Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#0A0F1D]/80 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/10 flex-shrink-0">
              <span className="text-slate-950 font-black text-sm tracking-wider">
                EV
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-sm sm:text-base leading-tight tracking-tight">
                  EventViet
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                  Agency Demo
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Trợ lý AI tư vấn tổ chức sự kiện chuyên nghiệp
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">
                AI Sẵn sàng 24/7
              </span>
            </div>

            {/* Quick booking CTA button */}
            <button
              onClick={() => handleSelectPackage("")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <span>📅</span>
              <span className="hidden xs:inline">Đặt lịch tư vấn</span>
              <span className="xs:hidden">Đặt lịch</span>
            </button>

            {/* Admin Link */}
            <a
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all"
            >
              Admin ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-hidden max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chat Column (Mobile: Full width, Desktop: 7 or 8 columns) */}
          <div className="h-full col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col min-h-0">
            <ChatWindow externalBookingRequest={externalBooking} />
          </div>

          {/* Right Showcase Sidebar (Desktop only - 5 or 4 columns) */}
          <aside className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col gap-4 overflow-y-auto pr-1">
            {/* Package 1: Year-End Gala */}
            <div className="p-4 rounded-2xl bg-[#0E1526]/80 border border-white/[0.08] backdrop-blur-md shadow-xl hover:border-amber-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Mùa lễ hội
                </span>
                <span className="text-amber-400 font-bold text-xs">
                  Từ 30.000.000đ
                </span>
              </div>
              <h3 className="text-white font-bold text-sm group-hover:text-amber-300 transition-colors">
                🎉 Year-End Party & Gala Dinner
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Kịch bản sáng tạo theo concept doanh nghiệp, âm thanh ánh sáng sân khấu biểu diễn, MC và vũ đoàn chuyên nghiệp.
              </p>
              <button
                onClick={() => handleSelectPackage("Year-end Party / Gala Dinner")}
                className="mt-3 w-full py-2 rounded-xl bg-white/[0.05] hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all border border-white/10 hover:border-amber-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Nhận báo giá & tư vấn gói này</span>
                <span>→</span>
              </button>
            </div>

            {/* Package 2: Corporate Conference */}
            <div className="p-4 rounded-2xl bg-[#0E1526]/80 border border-white/[0.08] backdrop-blur-md shadow-xl hover:border-amber-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  Doanh nghiệp
                </span>
                <span className="text-amber-400 font-bold text-xs">
                  Từ 20.000.000đ
                </span>
              </div>
              <h3 className="text-white font-bold text-sm group-hover:text-amber-300 transition-colors">
                🏢 Hội nghị & Hội thảo Cấp cao
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Setup phòng họp chuẩn quốc tế, màn hình LED P2.5 siêu nét, hệ thống dịch cabin đa ngôn ngữ, teabreak chuẩn 5 sao.
              </p>
              <button
                onClick={() =>
                  handleSelectPackage("Hội nghị / Hội thảo Doanh nghiệp")
                }
                className="mt-3 w-full py-2 rounded-xl bg-white/[0.05] hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all border border-white/10 hover:border-amber-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Nhận báo giá & tư vấn gói này</span>
                <span>→</span>
              </button>
            </div>

            {/* Package 3: Team Building */}
            <div className="p-4 rounded-2xl bg-[#0E1526]/80 border border-white/[0.08] backdrop-blur-md shadow-xl hover:border-amber-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Gắn kết
                </span>
                <span className="text-amber-400 font-bold text-xs">
                  Từ 15.000.000đ
                </span>
              </div>
              <h3 className="text-white font-bold text-sm group-hover:text-amber-300 transition-colors">
                🤝 Team Building & Outdoor Retreat
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Đạo cụ thử thách độc lạ, kịch bản lan toả thông điệp lãnh đạo, đội ngũ quản trò giàu năng lượng, bảo hiểm du lịch trọn gói.
              </p>
              <button
                onClick={() =>
                  handleSelectPackage("Team Building / Retreat Ngoài trời")
                }
                className="mt-3 w-full py-2 rounded-xl bg-white/[0.05] hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all border border-white/10 hover:border-amber-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Nhận báo giá & tư vấn gói này</span>
                <span>→</span>
              </button>
            </div>

            {/* Direct Contact Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg flex-shrink-0">
                  📞
                </div>
                <div>
                  <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                    Hotline Khẩn Cấp 24/7
                  </div>
                  <div className="text-white font-bold text-base">
                    1900 6868 · 0909 123 456
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    Hà Nội & TP. Hồ Chí Minh
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="flex-shrink-0 py-2.5 px-4 text-center border-t border-white/[0.06] bg-[#0A0F1D]/60 backdrop-blur-sm z-10 flex items-center justify-between max-w-7xl mx-auto w-full text-[11px] text-slate-400">
        <div>
          EventViet Agency · Hệ thống tư vấn tổ chức sự kiện số 1 Việt Nam
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Hỗ trợ khách hàng 24/7</span>
          <a
            href="/admin"
            className="text-amber-400/80 hover:text-amber-300 transition-colors font-medium"
          >
            Cổng Quản Trị Admin →
          </a>
        </div>
      </footer>
    </div>
  );
}
