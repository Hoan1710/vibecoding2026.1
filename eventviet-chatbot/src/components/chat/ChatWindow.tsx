"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import type { Booking } from "@/lib/schemas";
import PricingComparisonCard from "./PricingComparisonCard";
import InChatBookingCard from "./InChatBookingCard";
import BookingConfirmationTicket from "./BookingConfirmationTicket";
import TypingIndicator from "./TypingIndicator";

interface ChatWindowProps {
  onToggleSidebar?: () => void;
  externalPrompt?: string | null;
}

interface CustomChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  type?: "pricing" | "booking_form" | "booking_confirmed" | "text";
  bookingData?: Booking;
  followups?: string[];
}

export default function ChatWindow({ onToggleSidebar, externalPrompt }: ChatWindowProps) {
  const { messages: liveMessages, isLoading, sendMessage: sendApiMessage } = useChat();

  const [inputVal, setInputVal] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Initial demo conversation matching Stitch Canvas precisely
  const [messages, setMessages] = useState<CustomChatMessage[]>([
    {
      id: "m-user-1",
      sender: "user",
      text: "Tôi muốn hỏi về chi phí tổ chức tiệc tri ân khách hàng 200 khách.",
      time: "14:22 • Đã xem",
      type: "text",
    },
    {
      id: "m-ai-1",
      sender: "ai",
      text: "Dạ thưa Quý khách, với quy mô 200 khách cho dạ tiệc Tri ân Khách hàng (Customer Appreciation Gala), EventHHD phân bổ 3 phân khúc chuẩn mực để doanh nghiệp dễ dàng cân đối ngân sách:",
      time: "14:22",
      type: "pricing",
      followups: [
        "Xem mẫu kịch bản chi tiết?",
        "Ưu đãi đặt sảnh tiệc 5 sao?",
        "Tôi muốn gặp chuyên viên tư vấn",
      ],
    },
    {
      id: "m-user-2",
      sender: "user",
      text: "Tôi muốn thuê phi cơ riêng và trực thăng đón khách VIP từ sân bay đến resort ngay trong đêm tiệc?",
      time: "14:24 • Đã xem",
      type: "text",
    },
    {
      id: "m-ai-2",
      sender: "ai",
      text: "Hạng mục phi cơ riêng & trực thăng đón khách VIP thuộc dịch vụ Concierge đặc quyền ngoài danh mục tiêu chuẩn đại chúng. Quy trình này đòi hỏi phê duyệt đường bay từ Cục Hàng không Dân dụng, bố trí bãi đáp trực thăng tại resort và quy chuẩn an ninh hộ tống chuyên biệt.\n\nĐể chuẩn bị chu đáo, bảo mật và an toàn nhất, em xin mời Anh/Chị đặt lịch tư vấn 1-1 trực tiếp với Giám đốc Điều phối sự kiện cấp cao:",
      time: "14:24",
      type: "booking_form",
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external prompt when selected from sidebar
  useEffect(() => {
    if (externalPrompt) {
      handleUserSendMessage(externalPrompt);
    }
  }, [externalPrompt]);

  // Sync with live AI messages from useChat
  useEffect(() => {
    if (liveMessages.length > 0) {
      const last = liveMessages[liveMessages.length - 1];
      if (last.role === "assistant") {
        setMessages((prev) => [
          ...prev,
          {
            id: `api-ai-${Date.now()}`,
            sender: "ai",
            text: last.content,
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            type: last.content.toLowerCase().includes("báo giá") || last.content.toLowerCase().includes("chi phí") ? "pricing" : "text",
            followups: ["Xem bảng giá trọn gói", "Tôi muốn gặp chuyên viên tư vấn"],
          },
        ]);
      }
    }
  }, [liveMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showBookingForm, confirmedBooking]);

  const handleUserSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputVal).trim();
    if (!text) return;

    setInputVal("");

    const nowTime = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add user message
    const userMsg: CustomChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: `${nowTime} • Đã gửi`,
      type: "text",
    };

    setMessages((prev) => [...prev, userMsg]);

    // Check if query is about booking
    if (
      text.toLowerCase().includes("tư vấn") ||
      text.toLowerCase().includes("đặt lịch") ||
      text.toLowerCase().includes("hẹn") ||
      text.toLowerCase().includes("chuyên viên")
    ) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-booking-${Date.now()}`,
            sender: "ai",
            text: "Dạ vâng, để chuẩn bị kịch bản chu đáo và báo giá chuẩn xác nhất, em xin mời Anh/Chị điền thông tin phiếu hẹn dưới đây. Giám đốc Điều phối sẽ liên hệ hỗ trợ Anh/Chị ngay ạ:",
            time: nowTime,
            type: "booking_form",
          },
        ]);
      }, 500);
      return;
    }

    // Call AI backend
    sendApiMessage(text);
  };

  const handleFollowupClick = (f: string) => {
    if (f.includes("chuyên viên tư vấn") || f.includes("đặt lịch")) {
      setShowBookingForm(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `user-btn-${Date.now()}`,
          sender: "user",
          text: f,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
        {
          id: `ai-form-${Date.now()}`,
          sender: "ai",
          text: "Dạ vâng, em xin gửi phiếu đặt lịch tư vấn 1-1 trực tiếp với Giám đốc Điều phối cấp cao:",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          type: "booking_form",
        },
      ]);
    } else {
      handleUserSendMessage(f);
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    setConfirmedBooking(booking);
    setMessages((prev) => [
      ...prev,
      {
        id: `confirmed-${Date.now()}`,
        sender: "ai",
        text: "Chúc mừng Quý khách! Lịch hẹn đã được hệ thống ghi nhận thành công:",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        type: "booking_confirmed",
        bookingData: booking,
      },
    ]);
  };

  const handleResetChat = () => {
    if (confirm("Làm mới lại cuộc hội thoại với AI Eve?")) {
      setMessages([]);
      setConfirmedBooking(null);
      setShowBookingForm(false);
    }
  };

  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.time}] ${m.sender === "ai" ? "Trợ lý AI Eve" : "Khách hàng"}: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([`BIÊN BẢN TƯ VẤN SỰ KIỆN - EVENTHHD\nNgày: ${new Date().toLocaleDateString("vi-VN")}\n\n${transcript}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bien-ban-tu-van-EventHHD-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleMic = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputVal("Báo giá tiệc Gala cuối năm 300 khách tại Khách sạn Sheraton");
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const faqInitialChips = [
    { text: "Chi phí tổ chức tiệc cưới trọn gói?", icon: "payments" },
    { text: "Quy trình đặt cọc và thanh toán?", icon: "receipt_long" },
    { text: "Thời gian chuẩn bị sự kiện mất bao lâu?", icon: "schedule" },
    { text: "Chính sách bảo hiểm & rủi ro thời tiết?", icon: "umbrella" },
    { text: "Có hỗ trợ MC song ngữ & kịch bản không?", icon: "mic" },
    { text: "Ưu đãi cho khách hàng doanh nghiệp?", icon: "corporate_fare" },
    { text: "Danh sách địa điểm sảnh tiệc 5 sao liên kết?", icon: "domain" },
    { text: "Tiêu chuẩn an ninh và bảo mật VIP Summit?", icon: "shield_lock" },
  ];

  return (
    <section className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-w-0 transition-all h-full max-h-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUserSendMessage(`[Đã đính kèm tài liệu: ${e.target.files[0].name}]`);
          }
        }}
      />

      {/* Header of Chat Window */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-[#f2f4f6] border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">cognition</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-title-md text-xs sm:text-sm text-slate-900 font-bold truncate">
                Trợ lý AI Tư vấn Sự kiện 24/7
              </span>
              <span className="material-symbols-outlined text-[#4f46e5] text-[16px] shrink-0" title="Đã chứng thực">
                verified
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-[#464555] flex items-center gap-1.5 truncate">
              <span>Phản hồi thông minh tức thì</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-medium">Sẵn sàng kết nối Điều phối viên</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportChat}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-xs"
            title="Xuất biên bản cuộc trò chuyện"
          >
            <span className="material-symbols-outlined text-[15px] text-[#4f46e5]">download</span>
            <span className="hidden md:inline">Xuất biên bản</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-xs"
            title="Làm mới cuộc trò chuyện"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-500">restart_alt</span>
            <span className="hidden md:inline">Làm mới</span>
          </button>

          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] border border-indigo-200 shadow-xs transition-all"
              title="Ẩn / Hiện thanh trợ giúp bên phải"
            >
              <span className="material-symbols-outlined text-[18px]">
                dock_to_right
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Stream Scrollable Container */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto bg-slate-50/50 flex-1 min-h-0">
        {/* Welcome Greeting Card with initial FAQ Chips */}
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="w-9 h-9 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[19px]">hotel_class</span>
          </div>
          <div className="space-y-3 flex-1 min-w-0">
            <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-xs space-y-1">
              <p className="font-title-md text-sm text-[#3525cd] font-bold">
                Kính chào Quý khách đến với EventHHD!
              </p>
              <p className="font-body-md text-xs sm:text-sm text-slate-700 leading-relaxed">
                Em là <strong>Trợ lý AI Eve</strong>. Em có thể tính toán dự toán sơ bộ, gợi ý kịch bản âm thanh ánh sáng, kiểm tra lịch trống địa điểm 5 sao và sắp xếp lịch hẹn riêng với Giám đốc Điều phối. Quý khách vui lòng chọn câu hỏi phổ biến hoặc gõ yêu cầu cụ thể bên dưới:
              </p>
            </div>

            {/* Initial 8 FAQ Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {faqInitialChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUserSendMessage(chip.text)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs shadow-xs transition-all text-left flex items-center gap-1.5 cursor-pointer hover:border-indigo-300"
                >
                  <span className="material-symbols-outlined text-[#4f46e5] text-[15px]">
                    {chip.icon}
                  </span>
                  <span>{chip.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic / Demo Chat History */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {msg.sender === "user" ? (
              /* User Bubble */
              <div className="flex justify-end items-end gap-2.5">
                <div className="max-w-xl p-3.5 sm:p-4 rounded-xl rounded-br-xs bg-[#4f46e5] text-white shadow-sm">
                  <p className="font-body-md text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                  <div className="text-right mt-1">
                    <span className="font-mono text-[10px] text-indigo-200">{msg.time}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#dae2fd] text-[#131b2e] flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                  KH
                </div>
              </div>
            ) : (
              /* AI Bubble */
              <div className="flex items-start gap-3 max-w-3xl">
                <div className="w-9 h-9 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <span className="material-symbols-outlined text-[19px]">hotel_class</span>
                </div>
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-xs space-y-2">
                    <p className="font-body-md text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Rich Breakdown 3-tier matrix if type is pricing */}
                    {msg.type === "pricing" && (
                      <PricingComparisonCard onSelectTier={(t) => handleUserSendMessage(`Tôi quan tâm ${t}`)} />
                    )}

                    {/* Booking Form if type is booking_form */}
                    {msg.type === "booking_form" && (
                      <InChatBookingCard onSuccess={handleBookingSuccess} />
                    )}

                    {/* Booking Confirmation Ticket */}
                    {msg.type === "booking_confirmed" && msg.bookingData && (
                      <BookingConfirmationTicket
                        booking={msg.bookingData}
                        onReschedule={() => setShowBookingForm(true)}
                      />
                    )}
                  </div>

                  {/* Contextual Follow-up Suggestion Pills */}
                  {msg.followups && msg.followups.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="font-label-md text-xs text-slate-500 mr-1">
                        Gợi ý tiếp theo:
                      </span>
                      {msg.followups.map((f, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleFollowupClick(f)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all shadow-xs flex items-center gap-1 border ${
                            f.includes("chuyên viên")
                              ? "bg-[#4f46e5] text-white hover:bg-[#3525cd] border-[#4f46e5] font-semibold"
                              : "bg-[#dae2fd] hover:bg-indigo-100 text-[#131b2e] border-indigo-200 font-medium"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {f.includes("chuyên viên") ? "calendar_add_on" : "menu_book"}
                          </span>
                          <span>{f}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <span className="material-symbols-outlined text-[19px]">hotel_class</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input & Command Console */}
      <div className="p-3 bg-[#f2f4f6] border-t border-slate-200 shrink-0">
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSendMessage();
          }}
        >
          <div className="relative flex items-center bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden p-1.5">
            {/* Action buttons on left */}
            <div className="flex items-center gap-0.5 pl-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Đính kèm tài liệu RFP hoặc Proposal"
              >
                <span className="material-symbols-outlined text-[18px]">attach_file</span>
              </button>

              <button
                type="button"
                onClick={toggleMic}
                className={`p-1.5 rounded-lg transition-colors ${
                  isRecording
                    ? "bg-red-50 text-red-600 animate-pulse ring-1 ring-red-400"
                    : "text-slate-500 hover:text-[#4f46e5] hover:bg-slate-100"
                }`}
                title="Nhập liệu bằng giọng nói (Voice AI)"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
              </button>
            </div>

            {/* Input field */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập câu hỏi hoặc yêu cầu tư vấn sự kiện (ví dụ: thực đơn tiệc, âm thanh ánh sáng)..."
              className="flex-1 px-3 py-1.5 bg-transparent text-slate-900 text-xs sm:text-sm focus:outline-none min-w-0"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-40 cursor-pointer"
            >
              <span>Gửi</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>

          {/* Quick Prompts & Disclaimer */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-slate-500">
            <span className="font-body-sm text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              AI tự động hỗ trợ 24/7 • Dữ liệu mã hóa TLS 1.3
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setInputVal("Chiết khấu thanh toán sớm cho hợp đồng quý 1/2026?")}
                className="hover:text-[#4f46e5] cursor-pointer hover:underline"
              >
                Hợp đồng & Điều khoản
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setInputVal("Danh sách thực đơn Fusion 8 món cho tiệc VIP?")}
                className="hover:text-[#4f46e5] cursor-pointer hover:underline"
              >
                Thực đơn Fine Dining
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
