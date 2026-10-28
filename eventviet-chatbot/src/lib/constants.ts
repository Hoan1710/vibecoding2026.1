// Ngưỡng retrieval: score tối thiểu để gọi LLM
export const RETRIEVAL_THRESHOLD = 2;

// Số FAQ top được truy xuất
export const TOP_K_FAQS = 3;

// Giới hạn tin nhắn
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_HISTORY_TURNS = 6;

// Giờ làm việc
export const WORK_DAYS = [1, 2, 3, 4, 5, 6]; // T2-T7 (0=CN, 1=T2, ..., 6=T7)
export const WORK_HOUR_START = 8;
export const WORK_HOUR_END = 17;
export const SLOT_STEP_MINUTES = 30;

// Giới hạn đặt lịch
export const MAX_BOOKINGS_PER_SLOT = 2;

// Timeout AI (ms)
export const AI_TIMEOUT_MS = 8000;

// Rate limit
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút

// Schema version cho localStorage
export const BOOKING_SCHEMA_VERSION = 1;
export const BOOKING_STORAGE_KEY = "eventviet_bookings";
