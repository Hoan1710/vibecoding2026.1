# EventViet Demo – Chatbot FAQ & Đặt lịch tư vấn

> **Vibe-Coding 2026 · Bảng A · Đề 4**  
> Công ty hư cấu: **EventViet Demo** — Dữ liệu FAQ tự xây dựng (10 câu, không lấy từ nguồn thực)

## 🔗 Demo

- **Live**: _(link Vercel sau khi deploy)_
- **Repo**: d:/Projects/vibecoding2026.1/eventviet-chatbot

---

## 📋 5 Tính năng

| # | Tính năng | Mô tả |
|---|---|---|
| 1 | **Chat FAQ** | Trả lời 10 câu hỏi về EventViet bằng AI, dựa trên knowledge base |
| 2 | **Related Questions + Options** | Mỗi câu trả lời có 3 câu gợi ý + 2–4 chip bấm được |
| 3 | **Out-of-scope detection** | Câu hỏi ngoài phạm vi → `needs_booking=true`, KHÔNG gọi LLM |
| 4 | **Đặt lịch tư vấn** | Form với validate SĐT, tên, ngày (T2-T7), slot 30 phút, max 2 lịch/slot |
| 5 | **Admin `/admin`** | Xem danh sách, đánh dấu đã xử lý, chỉ xóa lịch đã xử lý (kèm xác nhận) |

---

## 🛠 Công nghệ

- **Framework**: Next.js 15 App Router + TypeScript strict
- **Styling**: Tailwind CSS v4
- **Validation**: Zod (dùng chung client/server)
- **AI**: Anthropic SDK → Provider: [vilao.ai](https://api.vilao.ai/v1) · Model: `chib/gemini-3.8-flash`
- **Tests**: Vitest (56 tests, 5 files)
- **Storage**: localStorage (không database, không auth)

---

## 🚀 Cách chạy

### Chế độ Mock (không cần API key)

```bash
npm install
cp .env.example .env.local
# Sửa AI_MODE=mock trong .env.local
npm run dev
```

### Chế độ AI thật

```bash
# Trong .env.local:
ANTHROPIC_API_KEY=your-api-key
AI_MODEL=chib/gemini-3.8-flash
AI_BASE_URL=https://api.vilao.ai/v1
AI_MODE=real

npm run dev
```

### Chạy tests

```bash
npm test          # chạy một lần
npm run test:watch # watch mode
```

### Build production

```bash
npm run build
```

---

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── page.tsx           # Trang chủ + ChatWindow
│   ├── admin/page.tsx     # Quản lý lịch hẹn
│   └── api/chat/route.ts  # POST: validate → retrieve → LLM → fallback
├── components/
│   ├── chat/              # ChatWindow, MessageBubble, OptionChips, RelatedQuestions...
│   ├── booking/           # BookingForm, SlotPicker
│   └── admin/             # BookingTable, ConfirmDialog
├── lib/
│   ├── ai/                # client, prompt, mock, parseResponse
│   ├── kb/                # faq.data, retrieve, normalize
│   ├── booking/           # validate, slots, storage
│   ├── schemas.ts         # Zod schemas dùng chung
│   ├── rateLimit.ts       # Rate limit theo IP
│   └── constants.ts       # Ngưỡng, giới hạn, config
├── hooks/                 # useChat, useBookings
└── types/index.ts
```

---

## 🤖 AI & Giới hạn đã biết

- AI chỉ trả lời dựa trên 10 FAQ được cung cấp; không bịa giá hay chính sách
- Có fallback mock khi AI timeout (8s) hoặc trả JSON sai
- Khi dùng fallback: badge "⚡ Mô phỏng" hiển thị trên tin nhắn
- Retrieval dùng keyword matching (không embedding); hiệu quả tốt cho domain hẹp
- Rate limit: 20 request/phút/IP (in-memory, reset khi restart server)

---

## 📊 FAQ Data

10 câu FAQ tự xây dựng cho công ty hư cấu EventViet Demo:

1. Dịch vụ cung cấp
2. Loại sự kiện nhận tổ chức  
3. Khoảng giá tham khảo
4. Thời gian chuẩn bị tối thiểu
5. Địa điểm / venue
6. Thiết bị âm thanh ánh sáng
7. Quy trình làm việc
8. Đặt cọc & hợp đồng
9. Chính sách hủy / đổi lịch
10. Khu vực phục vụ

> ⚠️ Tất cả dữ liệu là **giả định** dành cho mục đích demo cuộc thi.
