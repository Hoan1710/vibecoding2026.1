"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function EntryPortalPage() {
  const router = useRouter();
  const { loginUser, loginAdmin } = useAuth();

  // Role selection: "customer" | "admin"
  const [selectedRole, setSelectedRole] = useState<"customer" | "admin">("customer");

  // Customer form inputs
  const [customerName, setCustomerName] = useState("Nguyễn Thanh Tuấn");
  const [customerPhone, setCustomerPhone] = useState("0912345678");
  const [customerError, setCustomerError] = useState("");

  // Admin form inputs
  const [adminEmail, setAdminEmail] = useState("admin@eventviet.vn");
  const [adminPassword, setAdminPassword] = useState("admin2026");
  const [adminError, setAdminError] = useState("");

  // Mockup interactive question preview
  const [mockPreviewText, setMockPreviewText] = useState("Dạ thưa Quý khách, EventViet sẵn sàng hỗ trợ khảo sát sảnh tiệc 5 sao, lên kịch bản âm thanh ánh sáng và dự toán chi phí trọn gói.");

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");

    if (!customerName.trim()) {
      setCustomerError("Vui lòng nhập tên của Quý khách.");
      return;
    }

    const cleanPhone = customerPhone.replace(/\s+/g, "");
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(cleanPhone)) {
      setCustomerError("Số điện thoại không hợp lệ (10 số, đầu số Việt Nam).");
      return;
    }

    loginUser(customerName.trim(), cleanPhone);
    router.push("/customer");
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    const res = loginAdmin(adminEmail, adminPassword);
    if (!res.success) {
      setAdminError(res.error || "Mật khẩu quản trị chưa chính xác (Mặc định: admin2026)");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffbf8] via-[#fff5ed] to-[#fffbf8] text-slate-900 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* ── TOP HEADER (MINIMALIST LIKE FIGURE 2) ────────────────────────── */}
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
            EV
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              EventViet
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
              AI Event Platform
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`transition-colors cursor-pointer ${
              selectedRole === "customer" ? "text-indigo-600 font-bold" : "hover:text-slate-900"
            }`}
          >
            Dành Cho Khách Hàng
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`transition-colors cursor-pointer ${
              selectedRole === "admin" ? "text-purple-700 font-bold" : "hover:text-slate-900"
            }`}
          >
            Cổng Quản Trị Viên
          </button>
          <Link href="/goi-dich-vu" className="hover:text-slate-900 transition-colors">
            Gói Dịch Vụ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole(selectedRole === "customer" ? "admin" : "customer")}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 shadow-xs transition-all cursor-pointer text-slate-700"
          >
            {selectedRole === "customer" ? "Chuyển sang Admin" : "Chuyển sang Khách Hàng"}
          </button>
        </div>
      </header>

      {/* ── MAIN HERO SECTION (EXACT LAYOUT OF FIGURE 2) ─────────────────── */}
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN: HERO HEADLINE & INLINE ROLE LOGIN GATE */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                AI Chatbot & Điều Phối Sự Kiện Thế Hệ Mới
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                AI Chatbot cho doanh nghiệp sự kiện của bạn
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                EventViet AI tức thì học hỏi từ dữ liệu bảng giá, kịch bản sự kiện và chính sách dịch vụ — tự động giải đáp khách hàng, tính toán dự toán chi phí và điều phối lịch hẹn 1-1 không cần can thiệp thủ công.
              </p>
            </div>

            {/* SEPARATED ROLE ACCESS TABS (INLINE, NO POPUP!) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-orange-100 space-y-5">
              {/* Tab Selector Buttons */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedRole("customer")}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === "customer"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>Khách Hàng (Customer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === "admin"
                      ? "bg-purple-700 text-white shadow-md shadow-purple-700/30"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span>Ban Quản Trị (Admin)</span>
                </button>
              </div>

              {/* Tab 1: Customer Entry */}
              {selectedRole === "customer" ? (
                <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Họ và tên Quý khách <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Số điện thoại liên hệ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                  </div>

                  {customerError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
                      {customerError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Vào Trải Nghiệm Chatbot Tư Vấn Sự Kiện</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Trải nghiệm hoàn toàn miễn phí • Không yêu cầu thẻ tín dụng • Tách biệt quyền quản trị
                  </p>
                </form>
              ) : (
                /* Tab 2: Admin Entry */
                <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs animate-in fade-in duration-150">
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Email Quản Trị Viên
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mật Khẩu Xác Thực Quản Trị
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Nhập admin2026"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Mật khẩu mặc định hệ thống: <strong className="text-purple-700 font-mono">admin2026</strong>
                      </p>
                    </div>
                  </div>

                  {adminError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
                      {adminError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Đăng Nhập Cổng Điều Hành Quản Trị</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Khu vực nội bộ dành cho Ban Điều Hành EventViet giám sát lịch hẹn và thông số chatbot
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE VISUAL MOCKUP (EXACT STYLE OF FIGURE 2) */}
          <div className="lg:col-span-6 relative">
            {/* Website Mockup Browser Canvas */}
            <div className="relative rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-2 sm:p-3 aspect-[4/3] flex flex-col">
              {/* Browser bar */}
              <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-2 text-slate-400 text-xs border border-slate-200/80 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-600 bg-white px-3 py-0.5 rounded-md border border-slate-200 flex-1">
                  eventviet.vn
                </span>
              </div>

              {/* Wireframe Web Layout in background */}
              <div className="flex-1 rounded-xl bg-orange-50/40 p-4 space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-1/3 bg-slate-200 rounded-md"></div>
                  <div className="h-2 w-2/3 bg-slate-200/70 rounded-md"></div>
                  <div className="h-2 w-1/2 bg-slate-200/50 rounded-md"></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="h-14 bg-white/80 rounded-xl border border-orange-100 p-2 space-y-1">
                    <div className="h-2.5 w-1/2 bg-indigo-200 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-14 bg-white/80 rounded-xl border border-orange-100 p-2 space-y-1">
                    <div className="h-2.5 w-1/2 bg-amber-200 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                  </div>
                </div>

                {/* FLOATING CHATBOT WIDGET OVERLAY (LIKE FIGURE 2) */}
                <div className="absolute right-3 bottom-3 w-[88%] sm:w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                  {/* Chat widget header */}
                  <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold text-xs shadow-xs">
                        EV
                      </div>
                      <div>
                        <div className="font-bold text-xs">AI Assistant Eve</div>
                        <div className="text-[10px] text-indigo-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Đang trực tuyến 24/7</span>
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-indigo-200">minimize</span>
                  </div>

                  {/* Chat widget body */}
                  <div className="p-3 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        AI
                      </div>
                      <div className="p-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 shadow-xs leading-relaxed text-[11px]">
                        {mockPreviewText}
                      </div>
                    </div>

                    {/* Quick interactive sample chips */}
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setMockPreviewText(
                            "Gói tiệc Gala Dinner 200 khách tại Khách sạn 5 sao có chi phí dự toán từ 1.650.000 VNĐ/khách (bao gồm thực đơn 7 món và âm thanh ánh sáng L'Acoustics K2)."
                          )
                        }
                        className="text-left p-1.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-medium transition-colors"
                      >
                        💡 Dự toán chi phí Gala 200 khách?
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setMockPreviewText(
                            "EventViet phục vụ tại TP.HCM, Hà Nội, Đà Nẵng, Phú Quốc và các resort ven biển trên toàn quốc với đội ngũ điều phối túc trực 24/7."
                          )
                        }
                        className="text-left p-1.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-medium transition-colors"
                      >
                        📍 Khu vực phục vụ sự kiện?
                      </button>
                    </div>
                  </div>

                  {/* Input dummy box */}
                  <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      placeholder="Nhập yêu cầu tư vấn sự kiện..."
                      className="flex-1 px-2.5 py-1 text-[11px] bg-slate-100 rounded-lg text-slate-500 focus:outline-none"
                    />
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[13px]">send</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 border-t border-orange-100 text-slate-500 text-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          © 2026 <strong>EventViet Corporation</strong>. Nền tảng điều phối & Chatbot sự kiện thông minh.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/goi-dich-vu" className="hover:text-slate-900">
            Biểu phí dịch vụ
          </Link>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className="text-purple-700 font-semibold hover:underline cursor-pointer"
          >
            Cổng Quản Trị Hệ Thống
          </button>
        </div>
      </footer>
    </div>
  );
}
