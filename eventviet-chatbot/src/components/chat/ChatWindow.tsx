"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import type { Booking, ChatOption } from "@/lib/schemas";
import PricingComparisonCard from "./PricingComparisonCard";
import InChatBookingCard from "./InChatBookingCard";
import BookingConfirmationTicket from "./BookingConfirmationTicket";
import OptionChips from "./OptionChips";
import RelatedQuestions from "./RelatedQuestions";
import BookingPrompt from "./BookingPrompt";
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
  options?: ChatOption[];
  relatedQuestions?: [string, string, string];
  needsBooking?: boolean;
  source?: "ai" | "mock";
  bookingDefaultEventType?: string;
}

export default function ChatWindow({ onToggleSidebar, externalPrompt }: ChatWindowProps) {
  const { messages: liveMessages, isLoading, sendMessage: sendApiMessage } = useChat();

  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initial demo conversation
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
      text: "Dạ thưa Quý khách, với quy mô 200 khách cho dạ tiệc Tri ân Khách hàng (Customer Appreciation Gala), EventViet phân bổ 3 phân khúc chuẩn mực để doanh nghiệp dễ dàng cân đối ngân sách:",
      time: "14:22",
      type: "pricing",
      options: [
        { id: "opt-1", label: "Xem chi tiết gói Prestige", action: "ask", payload: "Chi tiết gói Prestige Executive 200 khách" },
        { id: "opt-2", label: "Đặt lịch tư vấn trực tiếp 1-1", action: "open_booking", payload: "Tiệc Tri ân 200 khách" },
      ],
      relatedQuestions: [
        "Xem mẫu kịch bản chi tiết Gala Dinner?",
        "Ưu đãi sảnh tiệc 5 sao liên kết tại TP.HCM?",
        "Quy trình đặt cọc và thanh toán hợp đồng?",
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
      needsBooking: true,
      bookingDefaultEventType: "Dịch vụ Concierge VIP & Trực thăng",
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

  // Sync with live AI messages from useChat & bind full Contract Data
  useEffect(() => {
    if (liveMessages.length > 0) {
      const last = liveMessages[liveMessages.length - 1];
      if (last.role === "assistant") {
        const responseData = last.response;
        const isPricing =
          last.content.toLowerCase().includes("báo giá") ||
          last.content.toLowerCase().includes("chi phí") ||
          last.content.toLowerCase().includes("ngân sách");

        const needsBooking = responseData?.needs_booking === true;

        setMessages((prev) => [
          ...prev,
          {
            id: `api-ai-${Date.now()}`,
            sender: "ai",
            text: last.content,
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            type: needsBooking ? "booking_form" : isPricing ? "pricing" : "text",
            options: responseData?.options,
            relatedQuestions: responseData?.related_questions,
            needsBooking,
            source: responseData?.source,
            bookingDefaultEventType: needsBooking ? "Tư vấn Yêu cầu Sự kiện Đặc Biệt" : undefined,
          },
        ]);
      }
    }
  }, [liveMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, confirmedBooking]);

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

    // Check if query directly asks for booking
    const lower = text.toLowerCase();
    if (
      lower.includes("tư vấn 1-1") ||
      lower.includes("đặt lịch hẹn") ||
      lower.includes("gặp chuyên viên")
    ) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-booking-${Date.now()}`,
            sender: "ai",
            text: "Dạ vâng, để chuẩn bị kịch bản chu đáo và báo giá chuẩn xác nhất, em xin gửi Quý khách phiếu đặt lịch tư vấn 1-1 với Giám đốc Điều phối EventViet:",
            time: nowTime,
            type: "booking_form",
            needsBooking: true,
          },
        ]);
      }, 400);
      return;
    }

    // Call AI backend
    sendApiMessage(text);
  };

  const handleOptionClick = (action: string, payload?: string) => {
    if (action === "open_booking") {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-form-${Date.now()}`,
          sender: "ai",
          text: "Dạ vâng, em xin gửi phiếu đăng ký tư vấn 1-1 trực tiếp cùng Giám đốc Điều phối EventViet:",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          type: "booking_form",
          needsBooking: true,
          bookingDefaultEventType: payload || "Tư vấn Tổ chức Sự kiện",
        },
      ]);
    } else if (action === "link" && payload) {
      window.open(payload, "_blank");
    } else {
      handleUserSendMessage(payload);
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    setConfirmedBooking(booking);
    setMessages((prev) => [
      ...prev,
      {
        id: `confirmed-${Date.now()}`,
        sender: "ai",
        text: "Chúc mừng Quý khách! Lịch hẹn tư vấn 1-1 đã được hệ thống EventViet ghi nhận thành công:",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        type: "booking_confirmed",
        bookingData: booking,
      },
    ]);
  };

  const handleResetChat = () => {
    if (confirm("Làm mới lại cuộc hội thoại với Trợ lý AI Eve?")) {
      setMessages([]);
      setConfirmedBooking(null);
    }
  };

  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.time}] ${m.sender === "ai" ? "Trợ lý AI EventViet" : "Khách hàng"}: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([`BIÊN BẢN TƯ VẤN SỰ KIỆN - EVENTVIET DEMO\nNgày: ${new Date().toLocaleDateString("vi-VN")}\nTổng số lượt trao đổi: ${messages.length}\n\n${transcript}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bien-ban-tu-van-EventViet-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Web Speech API Native
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt hiện tại chưa hỗ trợ Web Speech API. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputVal(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Lỗi micro:", err);
      setIsListening(false);
    }
  };

  // Upload và phân tích Brief/RFP tệp khách hàng
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + " KB";

    if (file.type.includes("text") || fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = (event.target?.result as string)?.slice(0, 1000) ?? "";
        handleUserSendMessage(
          `[Đã đính kèm tệp: ${fileName} (${fileSize})]\nNội dung brief:\n"${textContent}"\n\nNhờ Trợ lý phân tích tệp này và đề xuất gói dịch vụ, kịch bản sơ bộ cho sự kiện.`
        );
      };
      reader.readAsText(file);
    } else {
      handleUserSendMessage(
        `[Đã gửi tài liệu đính kèm: ${fileName} (${fileSize})]\nEm muốn được tư vấn báo giá và phương án triển khai phù hợp cho tài liệu này.`
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const faqInitialChips = [
    { text: "Chi phí tổ chức tiệc cưới trọn gói?", icon: "payments" },
    { text: "Quy trình đặt cọc và hợp đồng?", icon: "receipt_long" },
    { text: "Thời gian chuẩn bị tối thiểu bao lâu?", icon: "schedule" },
    { text: "Chính sách hủy và đổi lịch sự kiện?", icon: "umbrella" },
    { text: "Có hỗ trợ MC song ngữ & kịch bản không?", icon: "mic" },
    { text: "Ưu đãi cho khách hàng doanh nghiệp?", icon: "corporate_fare" },
    { text: "Địa điểm và sảnh tiệc 5 sao liên kết?", icon: "domain" },
    { text: "Khu vực phục vụ sự kiện của EventViet?", icon: "location_on" },
  ];

  return (
    <section className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-w-0 transition-all h-full max-h-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        onChange={handleFileUpload}
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
                Trợ lý AI Tư vấn Sự kiện 24/7 (EventViet)
              </span>
              <span className="material-symbols-outlined text-[#4f46e5] text-[16px] shrink-0" title="Đã chứng thực">
                verified
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-[#464555] flex items-center gap-1.5 truncate">
              <span>Hỗ trợ RAG FAQ & Báo giá tức thì</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-medium">Đặt lịch tư vấn 1-1 trực tiếp</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportChat}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-xs cursor-pointer"
            title="Xuất biên bản cuộc trò chuyện"
          >
            <span className="material-symbols-outlined text-[15px] text-[#4f46e5]">download</span>
            <span className="hidden md:inline">Xuất biên bản</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-xs cursor-pointer"
            title="Làm mới cuộc trò chuyện"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-500">restart_alt</span>
            <span className="hidden md:inline">Làm mới</span>
          </button>

          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] border border-indigo-200 shadow-xs transition-all cursor-pointer"
              title="Ẩn / Hiện thanh câu hỏi thường gặp bên phải"
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
                Kính chào Quý khách đến với EventViet!
              </p>
              <p className="font-body-md text-xs sm:text-sm text-slate-700 leading-relaxed">
                Em là <strong>Trợ lý AI Eve</strong>. Em có thể giải đáp chính sách dịch vụ, tính toán dự toán sơ bộ, gợi ý kịch bản âm thanh ánh sáng và sắp xếp lịch hẹn riêng 1-1 với Giám đốc Điều phối sự kiện. Quý khách vui lòng chọn câu hỏi phổ biến hoặc gõ yêu cầu cụ thể bên dưới:
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

        {/* Dynamic Chat Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {msg.sender === "user" ? (
              /* User Bubble */
              <div className="flex justify-end items-end gap-2.5">
                <div className="max-w-xl p-3.5 sm:p-4 rounded-xl rounded-br-xs bg-[#4f46e5] text-white shadow-sm">
                  <p className="font-body-md text-xs sm:text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
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
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[11px] text-slate-500">
                      <span className="font-semibold text-indigo-600">EventViet AI Advisor</span>
                      {msg.source && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {msg.source === "ai" ? "Trí tuệ nhân tạo (LLM)" : "Tri thức xác thực"}
                        </span>
                      )}
                    </div>

                    <p className="font-body-md text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Rich Breakdown 3-tier matrix if type is pricing */}
                    {msg.type === "pricing" && (
                      <PricingComparisonCard onSelectTier={(t) => handleUserSendMessage(`Tôi quan tâm ${t}`)} />
                    )}

                    {/* Booking Prompt when AI identifies out-of-scope */}
                    {msg.needsBooking && msg.type !== "booking_form" && (
                      <BookingPrompt
                        onBook={() =>
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: `form-trigger-${Date.now()}`,
                              sender: "ai",
                              text: "Dạ vâng, em xin mời Quý khách để lại thông tin để Giám đốc Điều phối liên hệ tư vấn chuyên sâu 1-1:",
                              time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                              type: "booking_form",
                              bookingDefaultEventType: msg.bookingDefaultEventType,
                            },
                          ])
                        }
                      />
                    )}

                    {/* Booking Form if type is booking_form */}
                    {msg.type === "booking_form" && (
                      <InChatBookingCard
                        defaultEventType={msg.bookingDefaultEventType}
                        onSuccess={handleBookingSuccess}
                      />
                    )}

                    {/* Booking Confirmation Ticket */}
                    {msg.type === "booking_confirmed" && msg.bookingData && (
                      <BookingConfirmationTicket
                        booking={msg.bookingData}
                        onReschedule={() =>
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: `re-form-${Date.now()}`,
                              sender: "ai",
                              text: "Dạ vâng, Quý khách vui lòng chọn lại ngày và khung giờ mới:",
                              time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                              type: "booking_form",
                            },
                          ])
                        }
                      />
                    )}

                    {/* Option Chips (2–4 clickable chips) */}
                    {msg.options && msg.options.length > 0 && (
                      <OptionChips options={msg.options} onOptionClick={handleOptionClick} />
                    )}

                    {/* Related Questions (3 follow-up questions) */}
                    {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                      <RelatedQuestions
                        questions={msg.relatedQuestions}
                        onSelect={(q) => handleUserSendMessage(q)}
                      />
                    )}
                  </div>
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
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Đính kèm tài liệu Brief hoặc RFP sự kiện (.pdf, .txt, .docx)"
              >
                <span className="material-symbols-outlined text-[18px]">attach_file</span>
              </button>

              <button
                type="button"
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-50 text-red-600 animate-pulse ring-1 ring-red-400"
                    : "text-slate-500 hover:text-[#4f46e5] hover:bg-slate-100"
                }`}
                title={isListening ? "Đang lắng nghe giọng nói tiếng Việt... Bấm để dừng" : "Nói bằng giọng nói tiếng Việt (Web Speech AI)"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isListening ? "mic_in_browser" : "mic"}
                </span>
              </button>
            </div>

            {/* Input field */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={isListening ? "Đang lắng nghe giọng nói của Quý khách..." : "Nhập câu hỏi hoặc yêu cầu tư vấn sự kiện (ví dụ: thực đơn tiệc, âm thanh ánh sáng)..."}
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
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-slate-500 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>AI trả lời từ cơ sở dữ liệu xác thực của EventViet Demo</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleUserSendMessage("Tôi muốn gặp chuyên viên tư vấn trực tiếp 1-1")}
                className="hover:text-indigo-600 hover:underline cursor-pointer"
              >
                📅 Đặt lịch nhanh 1-1
              </button>
              <button
                type="button"
                onClick={() => handleUserSendMessage("Khoảng giá tham khảo các gói sự kiện thế nào?")}
                className="hover:text-indigo-600 hover:underline cursor-pointer"
              >
                💰 Bảng giá tham khảo
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
