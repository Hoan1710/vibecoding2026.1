"use client";

interface BookingPromptProps {
  onBook: () => void;
}

export default function BookingPrompt({ onBook }: BookingPromptProps) {
  return (
    <div className="ml-11 mr-2 my-2 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-start gap-3">
        <span className="text-xl">📅</span>
        <div className="flex-1">
          <h4 className="text-amber-200 font-semibold text-xs tracking-wide">
            CẦN TƯ VẤN KỊCH BẢN & DỰ TOÁN CHI TIẾT?
          </h4>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Chuyên viên EventViet sẵn sàng hỗ trợ khảo sát địa điểm, lên kịch bản và báo giá miễn phí 100%.
          </p>
          <button
            id="booking-prompt-btn"
            onClick={onBook}
            className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Đặt lịch tư vấn miễn phí</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
