"use client";

import { useState } from "react";
import { useBookings } from "@/hooks/useBookings";
import BookingTable from "@/components/admin/BookingTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function AdminPage() {
  const { bookings, wasReset, markProcessed, deleteProcessed } = useBookings();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "processed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleMarkProcessed = (id: string) => {
    markProcessed(id);
    showToast("✅ Đã đánh dấu xử lý lịch hẹn thành công");
  };

  const handleDeleteRequest = (id: string) => {
    setConfirmDelete(id);
  };

  const handleDeleteConfirm = () => {
    if (!confirmDelete) return;
    const success = deleteProcessed(confirmDelete);
    setConfirmDelete(null);
    if (success) {
      showToast("🗑️ Đã xóa lịch hẹn khỏi hệ thống");
    } else {
      showToast("❌ Chỉ xóa được lịch hẹn đã được xử lý");
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const processedCount = bookings.filter((b) => b.status === "processed").length;

  // Filter by tab + search query
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === "all" ? true : b.status === filter;
    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.name.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      (b.eventType && b.eventType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 ambient-glow flex flex-col">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-[#0E1526]/95 backdrop-blur-md border border-white/20 text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="border-b border-white/[0.08] bg-[#0A0F1D]/80 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/10 flex-shrink-0">
              <span className="text-slate-950 font-black text-sm tracking-wider">
                EV
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-sm sm:text-base leading-tight tracking-tight">
                  EventViet Admin Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  Quản lý lịch
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Hệ thống tiếp nhận & điều phối lịch hẹn tư vấn sự kiện
              </p>
            </div>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <span>←</span>
            <span className="hidden sm:inline">Về trang khách hàng</span>
            <span className="sm:hidden">Trang chủ</span>
          </a>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Storage reset warning if schema bumped */}
        {wasReset && (
          <div className="mb-6 px-4 py-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Dữ liệu lịch hẹn cũ đã được đặt lại để tương thích với cấu trúc mới.
            </span>
          </div>
        )}

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
          {/* Card 1: Tổng lịch */}
          <div className="bg-[#0E1526]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Tổng Lịch Hẹn
              </span>
              <span className="text-xl">📊</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {bookings.length}
            </div>
            <div className="text-slate-500 text-[11px] mt-1">
              Toàn bộ yêu cầu đã tiếp nhận
            </div>
          </div>

          {/* Card 2: Chờ xử lý */}
          <div className="bg-[#0E1526]/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Chờ Xử Lý
              </span>
              <span className="text-xl">⏳</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {pendingCount}
            </div>
            <div className="text-slate-500 text-[11px] mt-1">
              Cần liên hệ tư vấn khách hàng
            </div>
          </div>

          {/* Card 3: Đã xử lý */}
          <div className="bg-[#0E1526]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                Đã Hoàn Thành
              </span>
              <span className="text-xl">✅</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {processedCount}
            </div>
            <div className="text-slate-500 text-[11px] mt-1">
              Đã liên hệ hoặc chốt hợp đồng
            </div>
          </div>
        </div>

        {/* Filter Bar & Search Tool */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {(["all", "pending", "processed"] as const).map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filter === f
                    ? "bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {f === "all"
                  ? `Tất cả (${bookings.length})`
                  : f === "pending"
                  ? `⏳ Chờ xử lý (${pendingCount})`
                  : `✅ Đã xử lý (${processedCount})`}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc số ĐT..."
              className="w-full bg-[#121A2C] text-white placeholder-slate-500 rounded-xl px-3.5 py-2 pl-8 text-xs border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table / Cards Container */}
        <div className="bg-[#0E1526]/80 border border-white/[0.08] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          <BookingTable
            bookings={filteredBookings}
            onMarkProcessed={handleMarkProcessed}
            onDeleteProcessed={handleDeleteRequest}
          />
        </div>
      </main>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Xác nhận xóa lịch hẹn"
        message="Bạn có chắc chắn muốn xóa lịch hẹn này khỏi hệ thống? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa lịch hẹn"
        cancelLabel="Hủy bỏ"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
