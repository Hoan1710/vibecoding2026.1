import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";
import { ChatRequestWithContextSchema } from "@/lib/schemas";
import { retrieveWithContext } from "@/lib/kb/retrieve";
import { generateSuggestions, refineSuggestions } from "@/lib/suggestions";
import { getOutOfScopeResponse } from "@/lib/ai/mock";
import { callAIWithFallback } from "@/lib/ai/client";
import { RETRIEVAL_THRESHOLD, RESCHEDULE_KEYWORDS, URGENT_KEYWORDS } from "@/lib/constants";

// Detect intent từ message
function detectIntent(message: string): "reschedule" | "urgent" | "normal" {
  const lower = message.toLowerCase();
  if (RESCHEDULE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) return "reschedule";
  if (URGENT_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) return "urgent";
  return "normal";
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
      { status: 429 }
    );
  }

  // Parse + validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const parseResult = ChatRequestWithContextSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError =
      parseResult.error.issues?.[0]?.message ??
      parseResult.error.message ??
      "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { message, history, customerContext } = parseResult.data;

  // Detect intent trước
  const intent = detectIntent(message);

  // Nếu là đổi lịch → trả special response
  if (intent === "reschedule") {
    return NextResponse.json({
      answer:
        "Tôi hiểu bạn muốn đổi lịch hẹn. Vui lòng cho tôi biết số điện thoại bạn đã dùng khi đặt lịch để tôi tra cứu và hỗ trợ bạn.",
      options: [
        {
          id: "provide-phone",
          label: "Nhập số điện thoại",
          action: "ask",
          payload: "reschedule_lookup",
        },
        {
          id: "call-hotline",
          label: "Gọi hotline 1900 6886",
          action: "link",
          payload: "tel:19006886",
        },
      ],
      related_questions: [
        "Chính sách đổi lịch như thế nào?",
        "Mất phí khi đổi lịch không?",
        "Tôi có thể hủy lịch không?",
      ],
      needs_booking: false,
      matched_faq_ids: [],
      source: "mock" as const,
      intent: "reschedule",
    });
  }

  // Nếu là liên hệ gấp → trả urgent response
  if (intent === "urgent") {
    return NextResponse.json({
      answer:
        "Tôi hiểu đây là việc gấp. Để được hỗ trợ nhanh nhất, bạn có thể liên hệ trực tiếp qua các kênh sau:",
      options: [
        {
          id: "call-hotline",
          label: "Gọi ngay 1900 6886",
          action: "link",
          payload: "tel:19006886",
        },
        {
          id: "zalo",
          label: "Nhắn Zalo OA",
          action: "link",
          payload: "https://zalo.me/eventviet",
        },
        {
          id: "book-urgent",
          label: "Đặt lịch gấp",
          action: "open_booking",
          payload: "",
        },
      ],
      related_questions: [
        "Giờ làm việc của EventViet?",
        "Có hỗ trợ ngoài giờ không?",
        "Liên hệ chuyên viên qua kênh nào?",
      ],
      needs_booking: false,
      matched_faq_ids: [],
      source: "mock" as const,
      intent: "urgent",
    });
  }

  // Flow bình thường: retrieve có ngữ cảnh
  const { results: topFAQs, score: topScore } = retrieveWithContext(message, history);
  const matchedFaqIds = topFAQs.map((r) => r.faq.id);

  if (topScore < RETRIEVAL_THRESHOLD) {
    const outOfScope = getOutOfScopeResponse(matchedFaqIds);
    return NextResponse.json({
      ...outOfScope,
      related_questions: generateSuggestions({ message, history }),
      intent: "out_of_scope",
    });
  }

  const contextFAQs = topFAQs.map((r) => r.faq);
  const response = await callAIWithFallback(
    message,
    history,
    contextFAQs,
    matchedFaqIds,
    customerContext ?? null
  );

  return NextResponse.json({
    ...response,
    related_questions: refineSuggestions(response.related_questions, { message, history }),
    intent: "normal",
  });
}
