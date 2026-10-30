"use client";

import { useState } from "react";
import type { Booking } from "@/lib/schemas";
import { addBooking } from "@/lib/booking/storage";

interface InChatBookingCardProps {
  onSuccess: (booking: Booking) => void;
  defaultNote?: string;
}

export default function InChatBookingCard({
  onSuccess,
  defaultNote = "Tư vấn gói tiệc VIP và phương án tổ chức sự kiện trọn gói.",
}: InChatBookingCardProps) {
  const [selectedDate, setSelectedDate] = useState("2026-11-28");
  const [selectedSlot, setSelectedSlot] = useState("14:00 - 15:00");
  const [name, setName] = useState("Nguyễn Thanh Tuấn");
  const [phone, setPhone] = useState("0912 345 678");
  const [notes, setNotes] = useState(defaultNote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dates = [
    { label: "Thứ Sáu", display: "28/11", value: "2026-11-28" },
    { label: "Thứ Bảy", display: "29/11", value: "2026-11-29" },
    { label: "Thứ Hai", display: "01/12", value: "2026-12-01" },
    { label: "Thứ Ba", display: "02/12", value: "2026-12-02" },
  ];

  const timeSlots = [
    { slot: "09:00 - 10:00", label: "09:00 - 10:00 (Sáng)" },
    { slot: "14:00 - 15:00", label: "14:00 - 15:00 (Chiều)" },
    { slot: "16:30 - 17:30", label: "16:30 - 17:30 (VIP)" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên của Quý khách.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(cleanPhone)) {
      setErrorMessage("Số điện thoại không hợp lệ (10 số, đầu số Việt Nam).");
      return;
    }

    setIsSubmitting(true);

    try {
      const newBooking: Booking = {
        id: `HHD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        phone: cleanPhone,
        date: selectedDate,
        time: selectedSlot,
        eventType: "Gala VIP & Hội Nghị",
        notes: notes.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      addBooking(newBooking);
      onSuccess(newBooking);
    } catch (err) {
      console.error(err);
      setErrorMessage("Có lỗi xảy ra khi lưu lịch hẹn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-md space-y-5 my-3 text-slate-900 max-w-2xl">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 bg-slate-50 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 pt-5 rounded-t-xl border-b border-slate-200/80">
        <div>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdcc3] text-[#2f1500] uppercase font-mono tracking-wider">
            Bespoke Concierge
          </span>
          <h3 className="font-title-md text-base text-slate-900 font-bold mt-1">
            Phiếu Đặt Lịch Tư Vấn Trực Tiếp 1-1
          </h3>
        </div>
        <span className="material-symbols-outlined text-[#4f46e5] text-[28px]">
          handshake
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selector */}
        <div>
          <label className="block font-label-md text-xs text-slate-800 font-semibold mb-2">
            1. Chọn ngày gặp mặt (Trực tuyến hoặc Tại văn phòng EventHHD)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {dates.map((d) => {
              const isSelected = selectedDate === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDate(d.value)}
                  className={`p-2.5 rounded-lg text-center font-medium shadow-xs transition-all border ${
                    isSelected
                      ? "bg-[#4f46e5] text-white border-[#4f46e5] ring-2 ring-indigo-200"
                      : "bg-[#f2f4f6] text-slate-700 hover:bg-slate-200 border-slate-200"
                  }`}
                >
                  <span className={`block font-mono text-[11px] ${isSelected ? "opacity-90 text-white" : "text-slate-500"}`}>
                    {d.label}
                  </span>
                  <span className="font-headline-sm text-sm font-bold block mt-0.5">
                    {d.display}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selector */}
        <div>
          <label className="block font-label-md text-xs text-slate-800 font-semibold mb-2">
            2. Khung giờ khả dụng của Giám đốc Điều phối
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {timeSlots.map((t) => {
              const isSelected = selectedSlot === t.slot;
              return (
                <button
                  key={t.slot}
                  type="button"
                  onClick={() => setSelectedSlot(t.slot)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 border ${
                    isSelected
                      ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs ring-2 ring-indigo-200"
                      : "bg-[#f2f4f6] text-slate-700 hover:bg-slate-200 border-slate-200"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSelected ? "text-white" : "text-[#4f46e5]"}`}>
                    schedule
                  </span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Client Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-label-md text-xs text-slate-700 mb-1 font-medium">
              Họ và tên Quý khách *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#f2f4f6] text-slate-900 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5] transition-all"
            />
          </div>
          <div>
            <label className="block font-label-md text-xs text-slate-700 mb-1 font-medium">
              Số điện thoại liên hệ *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0912 345 678"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#f2f4f6] text-slate-900 text-xs font-mono border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block font-label-md text-xs text-slate-700 mb-1 font-medium">
            Ghi chú yêu cầu đặc biệt
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Cần hạ cánh trực thăng tại resort, 8 khách yếu nhân..."
            className="w-full px-3.5 py-2 rounded-lg bg-[#f2f4f6] text-slate-900 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5] transition-all resize-none"
          />
        </div>

        {errorMessage && (
          <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
        )}

        {/* Footer & Submit */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100">
          <span className="font-body-sm text-xs text-slate-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">lock</span>
            Thông tin được mã hóa bảo mật cấp độ doanh nghiệp
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#4f46e5] hover:bg-[#3525cd] text-white font-title-md text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              assignment_turned_in
            </span>
            <span>Xác nhận Đặt lịch tư vấn VIP</span>
          </button>
        </div>
      </form>
    </div>
  );
}

