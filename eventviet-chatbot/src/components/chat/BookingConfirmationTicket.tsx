"use client";

import type { Booking } from "@/lib/schemas";

interface BookingConfirmationTicketProps {
  booking: Booking;
  onReschedule?: () => void;
}

export default function BookingConfirmationTicket({
  booking,
  onReschedule,
}: BookingConfirmationTicketProps) {
  const handleAddToCalendar = () => {
    // Generate Google Calendar Link
    const title = encodeURIComponent("Lịch tư vấn sự kiện VIP - EventHHD");
    const details = encodeURIComponent(
      `Khách hàng: ${booking.name}\nSĐT: ${booking.phone}\nYêu cầu: ${booking.notes || "Tư vấn sự kiện"}\nChuyên gia: Vũ Hoàng Nam (Giám đốc Điều phối Cấp cao)`
    );
    const location = encodeURIComponent("Tầng 28, Pearl Plaza, 561A Điện Biên Phủ, Phường 25, Bình Thạnh, TP.HCM / Online");
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(calUrl, "_blank");
  };

  return (
    <div className="flex items-start gap-3.5 max-w-2xl my-3">
      {/* Avatar Icon */}
      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <span className="material-symbols-outlined text-[19px]">verified</span>
      </div>

      <div className="space-y-3 flex-1 min-w-0">
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-emerald-200/80 shadow-md space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 bg-emerald-50/60 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 px-4 sm:px-5 pt-4 rounded-t-xl border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-title-md text-sm sm:text-base text-slate-900 font-bold">
                Lịch Hẹn Tư Vấn Đã Được Xác Nhận
              </span>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#dae2fd] text-[#131b2e] border border-indigo-200">
              Mã lịch hẹn: #{booking.id}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <span className="font-body-sm text-[11px] text-slate-500 block mb-0.5">
                Thời gian gặp
              </span>
              <span className="font-title-md text-xs sm:text-sm text-slate-900 font-bold block">
                {booking.time || "14:00 - 15:00"}
              </span>
              <span className="font-mono text-[11px] text-[#4f46e5] font-semibold">
                {booking.date || "28/11/2026"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <span className="font-body-sm text-[11px] text-slate-500 block mb-0.5">
                Chuyên gia tiếp đón
              </span>
              <span className="font-title-md text-xs sm:text-sm text-slate-900 font-bold block">
                Vũ Hoàng Nam
              </span>
              <span className="font-body-sm text-[11px] text-[#934e00] font-semibold">
                Giám đốc Điều phối Cấp cao
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <span className="font-body-sm text-[11px] text-slate-500 block mb-0.5">
                Trạng thái lưu trữ
              </span>
              <span className="inline-flex items-center gap-1 font-label-md text-xs text-emerald-700 font-semibold mt-0.5">
                <span className="material-symbols-outlined text-[15px]">cloud_done</span>
                Đã lưu hệ thống
              </span>
              <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                SMS & Email đã gửi xác thực
              </span>
            </div>
          </div>

          {/* Ticket Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="px-3.5 py-1.5 rounded-lg bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                <span>Lưu vào Google Calendar</span>
              </button>
              {onReschedule && (
                <button
                  type="button"
                  onClick={onReschedule}
                  className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                  <span>Đổi giờ hẹn</span>
                </button>
              )}
            </div>
            <span className="font-body-sm text-[11px] text-slate-500 italic">
              Hotline đón tiếp VIP: <strong className="text-slate-900">1900 6886</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

