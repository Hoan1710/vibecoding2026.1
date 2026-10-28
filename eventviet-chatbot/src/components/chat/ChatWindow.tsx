"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import OptionChips from "./OptionChips";
import RelatedQuestions from "./RelatedQuestions";
import TypingIndicator from "./TypingIndicator";
import BookingPrompt from "./BookingPrompt";
import BookingForm from "@/components/booking/BookingForm";

const WELCOME_OPTIONS = [
  {
    id: "w1",
    label: "🎉 Year-end Party & Gala",
    action: "ask" as const,
    payload: "Chi phí tổ chức year-end party là bao nhiêu?",
  },
  {
    id: "w2",
    label: "🏢 Hội nghị Doanh nghiệp",
    action: "ask" as const,
    payload: "EventViet tổ chức hội nghị doanh nghiệp như thế nào?",
  },
  {
    id: "w3",
    label: "🤝 Team Building Ngoài trời",
    action: "ask" as const,
    payload: "EventViet Demo tổ chức team building không?",
  },
  {
    id: "w4",
    label: "📅 Đặt lịch tư vấn miễn phí",
    action: "open_booking" as const,
    payload: "",
  },
];

interface ChatWindowProps {
  externalBookingRequest?: { eventType: string; timestamp: number } | null;
}

export default function ChatWindow({ externalBookingRequest }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingEventType, setBookingEventType] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger booking from external actions (e.g. Service showcase cards on Desktop)
  useEffect(() => {
    if (externalBookingRequest && externalBookingRequest.timestamp > 0) {
      setBookingEventType(externalBookingRequest.eventType || "");
      setShowBookingForm(true);
    }
  }, [externalBookingRequest]);

  // Scroll xuống khi có tin mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    sendMessage(text);
  };

  const handleOptionClick = (action: string, payload?: string) => {
    if (action === "open_booking") {
      setBookingEventType(payload ?? "");
      setShowBookingForm(true);
    } else if (action === "ask" && payload) {
      sendMessage(payload);
    } else if (action === "link" && payload) {
      window.open(payload, "_blank");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[#080C14]/60 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Welcome Card if no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 text-xs font-bold flex-shrink-0 shadow-md shadow-amber-500/20 ring-1 ring-white/10">
                  EV
                </div>
                <div className="max-w-[88%] sm:max-w-[82%]">
                  <div className="bg-[#111827] rounded-2xl rounded-tl-xs px-4 py-3.5 shadow-md border border-white/10 text-slate-100">
                    <p className="text-sm leading-relaxed">
                      Xin chào quý khách! Tôi là trợ lý AI chuyên môn của{" "}
                      <span className="font-bold text-amber-400">
                        EventViet
                      </span>
                      . Tôi có thể giải đáp chi tiết báo giá, ý tưởng kịch bản, địa điểm và kết nối đặt lịch tư vấn trực tiếp 1-1 miễn phí. 🎊
                    </p>
                  </div>
                  <OptionChips
                    options={WELCOME_OPTIONS}
                    onOptionClick={handleOptionClick}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Messages list */}
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;
            const response = msg.role === "assistant" ? msg.response : null;

            return (
              <div key={msg.id} className="flex flex-col gap-2">
                <MessageBubble message={msg} />
                {msg.role === "assistant" && response && isLast && (
                  <>
                    {response.needs_booking && (
                      <BookingPrompt
                        onBook={() => setShowBookingForm(true)}
                      />
                    )}
                    {response.options && response.options.length > 0 && (
                      <div className="ml-11">
                        <OptionChips
                          options={response.options}
                          onOptionClick={handleOptionClick}
                          align="left"
                        />
                      </div>
                    )}
                    {response.related_questions && (
                      <RelatedQuestions
                        questions={response.related_questions}
                        onSelect={(q) => sendMessage(q)}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs">
              <span className="text-sm">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-white/[0.08] bg-[#0A0F1D]/80 backdrop-blur-md">
          {bookingSuccess && (
            <div className="mb-2.5 px-3.5 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2">
              <span>✅</span>
              <span>Đặt lịch tư vấn thành công! Chuyên viên EventViet sẽ liên hệ quý khách sớm nhất.</span>
            </div>
          )}

          <div className="flex gap-2.5 items-center">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về chi phí tiệc, kịch bản hội nghị, team building..."
              maxLength={500}
              disabled={isLoading}
              className="flex-1 bg-[#121A2C] text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all disabled:opacity-50"
            />
            <button
              id="send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl px-4 sm:px-5 py-3 text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
              aria-label="Gửi tin nhắn"
            >
              <svg
                className="w-4 h-4 transform rotate-45 -translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px] mt-2 px-1">
            <span>💡 Nhấn Enter để gửi tin nhắn</span>
            <span>{inputValue.length}/500</span>
          </div>
        </div>
      </div>

      {/* Booking Modal / Bottom Sheet */}
      {showBookingForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg bg-[#0E1526] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <BookingForm
              defaultEventType={bookingEventType}
              onSuccess={() => {
                setShowBookingForm(false);
                setBookingSuccess(true);
                setTimeout(() => setBookingSuccess(false), 6000);
              }}
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
