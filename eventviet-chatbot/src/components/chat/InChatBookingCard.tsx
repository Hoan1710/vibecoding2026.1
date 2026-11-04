"use client";

import { useState, useEffect } from "react";
import type { Booking } from "@/lib/schemas";
import { addBooking, loadBookings } from "@/lib/booking/storage";
import { getAvailableWorkDays, generateDaySlots, type TimeSlot } from "@/lib/booking/slots";
import { validatePhone, validateName } from "@/lib/booking/validate";
import { MAX_BOOKINGS_PER_SLOT } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

interface InChatBookingCardProps {
  onSuccess: (booking: Booking) => void;
  defaultEventType?: string;
  defaultNote?: string;
}

export default function InChatBookingCard({
  onSuccess,
  defaultEventType = "Tư vấn Tổ chức Sự kiện Tổng thể",
  defaultNote = "Tư vấn gói tiệc VIP và phương án tổ chức sự kiện trọn gói.",
}: InChatBookingCardProps) {
  const { user } = useAuth();
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("09:00");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [eventType, setEventType] = useState(defaultEventType);
  const [notes, setNotes] = useState(defaultNote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const days = getAvailableWorkDays(7);
    setAvailableDays(days);
    if (days.length > 0) {
      setSelectedDate(days[0]);
    }
    setAllSlots(generateDaySlots());
    setBookings(loadBookings().bookings);
  }, []);

  // Cập nhật tên/SĐT nếu user đăng nhập thay đổi
  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  // Định dạng ngày hiển thị tiếng Việt
  const formatDayDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const dayNames = ["CN", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayName = dayNames[date.getDay()];
      return {
        dayName,
        displayDate: `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`,
      };
    } catch {
      return { dayName: "Ngày", displayDate: dateStr };
    }
  };

  // Tính số lượng booking đã có trong slot đã chọn
  const getSlotCount = (date: string, time: string) => {
    return bookings.filter(
      (b) => b.date === date && b.time.startsWith(time) && b.status !== "processed"
    ).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const nameErr = validateName(name);
    if (nameErr) {
      setErrorMessage(nameErr);
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneErr = validatePhone(cleanPhone);
    if (phoneErr) {
      setErrorMessage(phoneErr);
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Vui lòng chọn ngày gặp mặt.");
      return;
    }

    if (!selectedSlot) {
      setErrorMessage("Vui lòng chọn khung giờ hẹn.");
      return;
    }

    // Kiểm tra trùng slot tối đa
    if (getSlotCount(selectedDate, selectedSlot) >= MAX_BOOKINGS_PER_SLOT) {
      setErrorMessage(`Khung giờ ${selectedSlot} ngày ${selectedDate} đã kín lịch (tối đa ${MAX_BOOKINGS_PER_SLOT} lịch). Quý khách vui lòng chọn khung giờ khác.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const newBooking: Booking = {
        id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        phone: cleanPhone,
        date: selectedDate,
        time: selectedSlot,
        eventType: eventType.trim(),
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
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-indigo-200 shadow-md space-y-4 my-2 text-slate-900 max-w-2xl animate-in fade-in duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 bg-gradient-to-r from-indigo-50/70 to-slate-50 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 px-4 sm:px-5 pt-4 rounded-t-xl border-b border-indigo-100">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdcc3] text-[#2f1500] uppercase font-mono tracking-wider">
            EventViet Concierge
          </span>
          <h3 className="font-title-md text-sm sm:text-base text-slate-900 font-bold mt-0.5">
            Phiếu Đặt Lịch Tư Vấn Trực Tiếp 1-1
          </h3>
        </div>
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[20px]">event_available</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Date Selector */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
            <span>1. Chọn ngày tư vấn (Từ ngày mai, T2 - T7)</span>
            <span className="text-[11px] text-indigo-600 font-normal">Tối đa 2 lịch / khung giờ</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {availableDays.length === 0 ? (
              <div className="col-span-4 text-center py-2 text-slate-400">Đang tải lịch...</div>
            ) : (
              availableDays.slice(0, 4).map((d) => {
                const { dayName, displayDate } = formatDayDisplay(d);
                const isSelected = selectedDate === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`p-2 rounded-lg text-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                    }`}
                  >
                    <p className="font-bold text-xs">{dayName}</p>
                    <p className={`text-[11px] ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>{displayDate}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Time Slot Selector */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1.5">
            2. Khung giờ thuận tiện
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/80 rounded-lg border border-slate-200">
            {allSlots.map((s) => {
              const count = getSlotCount(selectedDate, s.time);
              const isFull = count >= MAX_BOOKINGS_PER_SLOT;
              const isSelected = selectedSlot === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={isFull}
                  onClick={() => setSelectedSlot(s.time)}
                  className={`p-1.5 rounded-md text-center text-xs font-medium border transition-all ${
                    isFull
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs cursor-pointer"
                      : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 cursor-pointer"
                  }`}
                >
                  <div>{s.label}</div>
                  {isFull && <span className="text-[9px] text-red-500 font-normal">Kín</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Họ và tên Quý khách <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Số điện thoại liên hệ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Event Type & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Loại hình sự kiện</label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Gala Dinner, Hội nghị, Ra mắt..."
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Ghi chú yêu cầu đặc biệt</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Số lượng khách, yêu cầu riêng..."
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{isSubmitting ? "Đang ghi nhận..." : "Xác Nhận Đặt Lịch Tư Vấn 1-1"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
