"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ChatWindow from "@/components/chat/ChatWindow";
import HelpSidebar from "@/components/chat/HelpSidebar";
import { loadBookings, saveBookings } from "@/lib/booking/storage";
import type { Booking } from "@/lib/schemas";
import { generateIcsFile } from "@/lib/calendar/generateIcs";
import { loadPricingConfig, type PackagePricingConfig } from "@/lib/services/packageStorage";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, isUserLoggedIn, logoutUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"chat" | "my_bookings" | "pricing">("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  // My Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchPhone, setSearchPhone] = useState(user?.phone || "");

  // Pricing State
  const [pricingConfig, setPricingConfig] = useState<PackagePricingConfig>(() => loadPricingConfig());
  const [guestCount, setGuestCount] = useState(200);
  const [venueTier, setVenueTier] = useState<"standard" | "5star" | "resort">("5star");
  const [avTier, setAvTier] = useState<"jbl" | "lacoustics" | "db">("lacoustics");
  const [fbTier, setFbTier] = useState<"standard" | "fusion" | "michelin">("fusion");
  const [talentTier, setTalentTier] = useState<"mc" | "vtv_band" | "star">("vtv_band");

  useEffect(() => {
    setBookings(loadBookings().bookings);
    setPricingConfig(loadPricingConfig());
    if (user?.phone) setSearchPhone(user.phone);
  }, [user]);

  const handleSelectFaqPrompt = (prompt: string) => {
    setActiveTab("chat");
    setSelectedPrompt(prompt);
    setTimeout(() => setSelectedPrompt(null), 300);
  };

  const handleCancelBooking = (id: string) => {
    if (confirm("Quý khách có chắc chắn muốn hủy lịch hẹn tư vấn này?")) {
      const updated = bookings.filter((b) => b.id !== id);
      saveBookings(updated);
      setBookings(updated);
    }
  };

  const myFilteredBookings = bookings.filter((b) => {
    const filterPhone = searchPhone.replace(/\s+/g, "").trim();
    const userName = user?.name?.toLowerCase() || "";
    if (!filterPhone) {
      return userName ? b.name.toLowerCase().includes(userName) : true;
    }
    return (
      b.phone.replace(/\s+/g, "").includes(filterPhone) ||
      (userName && b.name.toLowerCase().includes(userName))
    );
  });

  // Dynamic pricing calculation
  const fbTotal = (pricingConfig.venueRates[venueTier] + pricingConfig.fbRates[fbTier]) * guestCount;
  const techTotal = pricingConfig.avRates[avTier];
  const talentTotal = pricingConfig.talentRates[talentTier];
  const subtotal = fbTotal + techTotal + talentTotal;
  const vipDiscount = Math.round(subtotal * 0.05);
  const vat = Math.round((subtotal - vipDiscount) * 0.08);
  const grandTotal = subtotal - vipDiscount + vat;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " VNĐ";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f9fb] text-[#191c1e] font-sans">
      {/* ── CUSTOMER DEDICATED HEADER (HOÀN TOÀN TÁCH BIỆT ADMIN) ───────────── */}
      <header className="w-full z-40 bg-white shadow-xs border-b border-slate-200 shrink-0">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                EV
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#191c1e] text-base leading-tight">
                  EventViet
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Cổng Trải Nghiệm Khách Hàng
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs (Direct in Page, NO POPUP) */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">smart_toy</span>
              <span>Tư Vấn & Chatbot</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("my_bookings");
                setBookings(loadBookings().bookings);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "my_bookings"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">calendar_month</span>
              <span>Lịch Hẹn Của Tôi</span>
              {myFilteredBookings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-mono">
                  {myFilteredBookings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">payments</span>
              <span>Dự Toán & Bảng Giá</span>
            </button>
          </nav>

          {/* Customer Profile & Exit to Home */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">
                {user?.name || "Khách Hàng Trải Nghiệm"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {user?.phone || "0912345678"}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(user?.name || "K").charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                router.push("/");
              }}
              className="px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              title="Thoát về trang mở đầu"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden md:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ACCORDING TO ACTIVE TAB ────────────────────────────── */}
      <main className="w-full flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {/* TAB 1: CHATBOT TƯ VẤN & ĐẶT LỊCH */}
        {activeTab === "chat" && (
          <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
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
        )}

        {/* TAB 2: LỊCH HẸN CỦA TÔI (RENDER TRỰC TIẾP, KHÔNG POPUP) */}
        {activeTab === "my_bookings" && (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 overflow-y-auto space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600">calendar_month</span>
                  <span>Danh Sách Lịch Hẹn Tư Vấn Của Quý Khách</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi tiến độ xác nhận, tải lịch về điện thoại hoặc đổi giờ hẹn trực tiếp.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Lọc theo số điện thoại..."
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                />
              </div>
            </div>

            {myFilteredBookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <span className="material-symbols-outlined text-5xl text-slate-300">event_busy</span>
                <p className="text-sm font-semibold text-slate-700">Chưa có lịch hẹn tư vấn nào</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Quý khách có thể quay lại tab Chatbot để trò chuyện với Trợ lý AI và đăng ký lịch tư vấn trực tiếp 1-1 miễn phí.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Trò Chuyện Đặt Lịch Ngay</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myFilteredBookings.map((b) => {
                  const isProcessed = b.status === "processed";
                  return (
                    <div
                      key={b.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 transition-all shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                            #{b.id}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {b.eventType || "Tư vấn Tổ chức Sự kiện Tổng thể"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            isProcessed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {isProcessed ? "Đã xác nhận & xếp lịch" : "Chờ tiếp nhận"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Thời gian gặp mặt:</span>
                          <strong className="text-slate-900">{b.time}</strong> • Ngày {b.date}
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Thông tin liên hệ:</span>
                          <strong className="text-slate-900">{b.name}</strong> ({b.phone})
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Yêu cầu & Ghi chú:</span>
                          <span className="text-slate-700 line-clamp-1">{b.notes || "Không có ghi chú"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => generateIcsFile(b, "EventViet")}
                            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            <span>Tải Lịch (.ics)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const title = encodeURIComponent("[EventViet] Lịch tư vấn sự kiện 1-1");
                              const details = encodeURIComponent(`Khách hàng: ${b.name}\nSĐT: ${b.phone}\nLoại: ${b.eventType}`);
                              const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
                              window.open(calUrl, "_blank");
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            <span>Lưu Google Calendar</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>Hủy lịch hẹn</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DỰ TOÁN CHI PHÍ & BẢNG GIÁ */}
        {activeTab === "pricing" && (
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 overflow-y-auto space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">calculate</span>
                <span>Công Cụ Dự Toán Chi Phí Sự Kiện Động</span>
              </h2>
              <p className="text-xs text-slate-500">
                Biểu phí định mức chuẩn mực được cấu hình đồng bộ trực tiếp từ Ban Điều Hành EventViet.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-800">
                    <span>Quy mô số lượng khách tham dự:</span>
                    <span className="text-indigo-600 font-bold text-sm font-mono">{guestCount} Khách</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={25}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Tiêu chuẩn Sảnh tiệc / Venue:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "standard", label: "Sảnh 4 sao", price: pricingConfig.venueRates.standard },
                      { id: "5star", label: "5 sao quốc tế", price: pricingConfig.venueRates["5star"] },
                      { id: "resort", label: "Resort bãi biển", price: pricingConfig.venueRates.resort },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVenueTier(v.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          venueTier === v.id
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <p>{v.label}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatVND(v.price)}/khách</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Âm thanh Ánh sáng & Sân khấu LED:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "jbl", label: "JBL Pro Basic", price: pricingConfig.avRates.jbl },
                      { id: "lacoustics", label: "L'Acoustics K2", price: pricingConfig.avRates.lacoustics },
                      { id: "db", label: "d&b Audiotechnik", price: pricingConfig.avRates.db },
                    ].map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvTier(av.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          avTier === av.id
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <p>{av.label}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatVND(av.price)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Receipt Summary */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-bold text-sm tracking-wide">BẢNG DỰ TOÁN NGÂN SÁCH</span>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded">QUÝ IV/2026</span>
                  </div>

                  <div className="space-y-2.5 text-xs py-4 divide-y divide-white/10">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-300">Sảnh tiệc & Thực đơn ({guestCount} khách):</span>
                      <strong className="font-mono">{formatVND(fbTotal)}</strong>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-300">Kỹ thuật âm thanh ánh sáng:</span>
                      <strong className="font-mono">{formatVND(techTotal)}</strong>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-300">Nhân sự MC & Biểu diễn:</span>
                      <strong className="font-mono">{formatVND(talentTotal)}</strong>
                    </div>
                    <div className="flex justify-between pt-2 text-emerald-400">
                      <span>Ưu đãi VIP (-5%):</span>
                      <strong className="font-mono">-{formatVND(vipDiscount)}</strong>
                    </div>
                    <div className="flex justify-between pt-2 text-slate-300">
                      <span>Thuế VAT (8%):</span>
                      <strong className="font-mono">{formatVND(vat)}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-300 uppercase font-semibold">TỔNG DỰ TOÁN:</span>
                    <span className="text-xl font-bold font-mono text-amber-300">{formatVND(grandTotal)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("chat")}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">calendar_add_on</span>
                    <span>Chat Với AI Để Nhận Báo Giá Này</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
