"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  role?: "client" | "admin";
}

export default function Header({ role }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAdmin = role === "admin" || pathname.startsWith("/admin");

  const navLinks = [
    {
      href: "/",
      label: "Khách hàng - Chatbot Tư vấn & Đặt lịch",
      active: pathname === "/",
      icon: "smart_toy",
    },
    {
      href: "/goi-dich-vu",
      label: "Gói Dịch Vụ & Báo Giá",
      active: pathname === "/goi-dich-vu",
      icon: "payments",
    },
    {
      href: "/admin",
      label: "Quản trị - Quản lý Lịch hẹn & FAQ",
      active: pathname.startsWith("/admin"),
      icon: "admin_panel_settings",
    },
  ];

  return (
    <header className="w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 shrink-0">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo image with stylish fallback */}
            <div className="h-10 flex items-center">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1Vf1FM8WAu0x0Qs7ks6P-9eI8uZNsxSQGbJBlwPLsJdGKy0SqCSmzTsCmurIyDmDv4kVzrmubNb93QObRqEf4rRVvNMAZLUmNe2FDvuNAGX2Zb69_DM8YdmJ8L46ApgPU5ejJxUJUg41mgkOD4ffJSoSqMfXes7ifIU5QBXAjL_9xe1M4tQnY6YVD5ASJAIz4V-YK8JK-VGI5OkLIS1nHc4uWW7eENw_XlJVBM7-J8u"
                alt="EventHHD Logo"
                className="h-8 sm:h-9 w-auto object-contain"
                onError={(e) => {
                  // Fallback in case remote image is blocked
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                style={{ display: "none" }}
                className="items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] text-white flex items-center justify-center font-bold text-sm shadow-md">
                  HHD
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#191c1e] text-base leading-tight font-headline-md tracking-tight">
                    EventHHD
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Aura Luxe Platform
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* AI Live Status Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f2f4f6] border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4f46e5] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4f46e5]"></span>
          </span>
          <span className="font-label-md text-label-md text-[#191c1e] text-xs">
            AI Trợ lý trực tuyến 24/7
          </span>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#f2f4f6] p-1.5 rounded-xl border border-slate-200/70">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                link.active
                  ? "bg-[#4f46e5] text-white shadow-sm"
                  : "text-[#464555] hover:text-[#191c1e] hover:bg-white/80"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Actions: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Thông báo"
              className="relative p-2 rounded-lg text-[#464555] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                  <span>Thông báo hệ thống</span>
                  <span className="text-[10px] text-[#4f46e5] cursor-pointer hover:underline">
                    Đánh dấu đã đọc
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="p-2 bg-indigo-50/60 rounded-lg text-slate-700">
                    <p className="font-semibold text-[#4f46e5]">Lịch hẹn mới #HHD-8924</p>
                    <p className="text-[11px] text-slate-500">Khách hàng vừa đặt lịch tư vấn VIP chiều nay.</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
                    <p className="font-semibold text-slate-800">Cập nhật bảng giá Q4/2026</p>
                    <p className="text-[11px] text-slate-500">Đã áp dụng định mức chiết khấu 10% cho hội viên.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-1 sm:pl-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-label-md text-xs text-[#191c1e] font-semibold leading-snug">
                {isAdmin ? "Ban Quản Trị" : "Khách hàng"}
              </span>
              <span className="font-code-sm text-[11px] text-[#464555]">
                {isAdmin ? "admin@eventhhd.vn" : "user@gmail.com"}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#3525cd] flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
              <span className="material-symbols-outlined text-[18px]">
                {isAdmin ? "shield_person" : "person"}
              </span>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#464555] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors ml-1"
            aria-label="Mở menu điều hướng"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-sm text-[#4f46e5]">
              navigation
            </span>
            <span>CHUYỂN GIAO DIỆN HỆ THỐNG</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  link.active
                    ? "bg-[#4f46e5] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Đang đăng nhập:</span>
            <span className="font-semibold text-slate-800">
              {isAdmin ? "admin@eventhhd.vn" : "user@gmail.com"}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

