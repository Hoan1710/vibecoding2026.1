import { z } from "zod";

// ── ChatRequest ──────────────────────────────────────────────────────────────
export const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Tin nhắn không được rỗng")
    .max(500, "Tin nhắn tối đa 500 ký tự"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(12) // 6 turns × 2 = 12 messages
    .optional()
    .default([]),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ── ChatOption ───────────────────────────────────────────────────────────────
export const ChatOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  action: z.enum(["ask", "open_booking", "link"]),
  payload: z.string().optional(),
});
export type ChatOption = z.infer<typeof ChatOptionSchema>;

// ── ChatResponse ─────────────────────────────────────────────────────────────
export const ChatResponseSchema = z.object({
  answer: z.string(),
  options: z
    .array(ChatOptionSchema)
    .min(2)
    .max(4),
  related_questions: z
    .tuple([z.string(), z.string(), z.string()]),
  needs_booking: z.boolean(),
  matched_faq_ids: z.array(z.string()),
  source: z.enum(["ai", "mock"]),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// ── Booking ──────────────────────────────────────────────────────────────────
export const BookingSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, "Tên phải từ 2 ký tự")
    .max(50, "Tên tối đa 50 ký tự"),
  phone: z
    .string()
    .regex(
      /^(0|\+84)(3|5|7|8|9)\d{8}$/,
      "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng SĐT Việt Nam"
    ),
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // HH:mm
  eventType: z.string().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["pending", "processed"]).default("pending"),
  createdAt: z.string(),
});
export type Booking = z.infer<typeof BookingSchema>;

// ── BookingStorage ────────────────────────────────────────────────────────────
export const BookingStorageSchema = z.object({
  schemaVersion: z.number(),
  bookings: z.array(BookingSchema),
});
export type BookingStorage = z.infer<typeof BookingStorageSchema>;
