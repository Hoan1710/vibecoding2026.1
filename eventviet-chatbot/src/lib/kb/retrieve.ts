import type { FAQ } from "@/types";
import { faqs } from "./faq.data";
import { tokenize } from "./normalize";
import { TOP_K_FAQS } from "@/lib/constants";

export interface RetrievedFAQ {
  faq: FAQ;
  score: number;
}

// Stop words phổ biến trong tiếng Việt - không dùng để matching
const STOP_WORDS = new Set([
  "va", "la", "co", "khong", "cua", "trong", "de", "duoc",
  "voi", "cac", "nhung", "nay", "do", "khi", "thi", "tu",
  "mot", "hai", "ba", "bon", "sau", "bay", "tam", "chin",
  "se", "da", "dang", "bi", "cho", "theo", "tren", "duoi",
  "truoc", "ngoai", "ben", "vao", "ra", "len", "xuong",
  "hom", "qua", "mai", "sang", "chieu",
  "ban", "chung", "ho", "no", "bao", "nhieu",
  "rat", "neu", "ma", "roi", "tat", "moi", "deu",
  "toi", "anh", "chi", "em", "ong", "ba",
  // Thêm từ phổ biến không đặc trưng cho dịch vụ sự kiện
  "thoi", "tiet", "gian", "noi", "nha", "nhu", "the",
  "biet", "phai", "duoc", "muon", "hieu", "xem", "xin",
  "gio", "ngay", "nam", "thang", "tuan", "phut",
]);

/**
 * Tính điểm match giữa query tokens và FAQ.
 * Chỉ dùng exact match với token có nghĩa (không phải stop word).
 */
function scoreFAQ(queryTokens: string[], faq: FAQ): number {
  // Build token set từ tags + question (nguồn quan trọng nhất)
  const tagAndQuestionText = [...faq.tags, faq.question].join(" ");
  const faqKeyTokens = new Set(tokenize(tagAndQuestionText));
  const answerTokens = tokenize(faq.answer);

  let score = 0;
  for (const qToken of queryTokens) {
    // Bỏ qua stop words và token quá ngắn
    if (STOP_WORDS.has(qToken) || qToken.length < 3) continue;

    // Exact match trong tags/question
    if (faqKeyTokens.has(qToken)) {
      score += 2;
    }

    // Extra bonus: exact match trong tags riêng
    for (const tag of faq.tags) {
      if (tokenize(tag).includes(qToken)) {
        score += 3;
      }
    }

    // Partial match chỉ với token dài ≥ 5 ký tự, trong answer
    if (qToken.length >= 5) {
      for (const aToken of answerTokens) {
        if (aToken !== qToken && aToken.length >= 5 &&
          (aToken.includes(qToken) || qToken.includes(aToken))) {
          score += 1;
        }
      }
    }
  }
  return score;
}

/**
 * Truy xuất top-K FAQ phù hợp nhất với câu hỏi.
 */
export function retrieveTopFAQs(
  query: string,
  k: number = TOP_K_FAQS
): RetrievedFAQ[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = faqs.map((faq) => ({
    faq,
    score: scoreFAQ(queryTokens, faq),
  }));

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/**
 * Trả về score cao nhất.
 */
export function getTopScore(query: string): number {
  const results = retrieveTopFAQs(query, 1);
  return results.length > 0 ? results[0].score : 0;
}
