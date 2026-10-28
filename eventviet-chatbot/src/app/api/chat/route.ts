import { NextRequest, NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/schemas";
import { retrieveTopFAQs, getTopScore } from "@/lib/kb/retrieve";
import { callAIWithFallback } from "@/lib/ai/client";
import { getOutOfScopeResponse } from "@/lib/ai/mock";
import { isRateLimited } from "@/lib/rateLimit";
import { RETRIEVAL_THRESHOLD } from "@/lib/constants";

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

  const parseResult = ChatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues?.[0]?.message ?? parseResult.error.message ?? "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { message, history } = parseResult.data;

  // Retrieve top FAQs
  const topFAQs = retrieveTopFAQs(message);
  const topScore = getTopScore(message);
  const matchedFaqIds = topFAQs.map((r) => r.faq.id);

  // Nếu score < ngưỡng → trả thẳng needs_booking=true, KHÔNG gọi LLM
  if (topScore < RETRIEVAL_THRESHOLD) {
    const outOfScope = getOutOfScopeResponse(matchedFaqIds);
    return NextResponse.json(outOfScope);
  }

  // Gọi AI với context FAQs
  const contextFAQs = topFAQs.map((r) => r.faq);
  const response = await callAIWithFallback(
    message,
    history,
    contextFAQs,
    matchedFaqIds
  );

  return NextResponse.json(response);
}
