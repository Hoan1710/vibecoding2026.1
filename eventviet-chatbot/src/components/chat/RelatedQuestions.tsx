"use client";

interface RelatedQuestionsProps {
  questions: [string, string, string];
  onSelect: (question: string) => void;
}

export default function RelatedQuestions({
  questions,
  onSelect,
}: RelatedQuestionsProps) {
  return (
    <div className="ml-11 mr-2 mt-2 bg-[#0E1526]/80 border border-white/[0.08] rounded-2xl p-3.5 backdrop-blur-md">
      <p className="text-amber-400/80 text-[11px] font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <span>💡</span>
        <span>Câu hỏi liên quan đề xuất</span>
      </p>
      <div className="flex flex-col gap-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            id={`related-q-${i}`}
            onClick={() => onSelect(q)}
            className="text-left text-xs text-slate-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-xl px-3 py-2 transition-all duration-150 border border-transparent hover:border-amber-500/20 flex items-center justify-between group cursor-pointer"
          >
            <span className="line-clamp-1">{q}</span>
            <span className="text-slate-500 group-hover:text-amber-400 text-xs transition-colors">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
