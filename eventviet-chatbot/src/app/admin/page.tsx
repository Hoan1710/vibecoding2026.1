"use client";

import { useState, useEffect } from "react";
import Header from "@/components/shared/Header";
import { loadBookings, saveBookings, deleteProcessedBooking } from "@/lib/booking/storage";
import type { Booking } from "@/lib/schemas";

interface AdminAppointment extends Booking {
  extendedStatus?: "pending" | "confirmed" | "completed" | "cancelled";
  clientCategory?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"crm" | "faq">("crm");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "tomorrow" | "week">("today");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected booking for Detail Modal
  const [selectedBooking, setSelectedBooking] = useState<AdminAppointment | null>(null);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isEditFAQModalOpen, setIsEditFAQModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<{ id: string; q: string; a: string; category: string } | null>(null);

  // Initial bookings populated with Stitch data if none in storage
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);

  useEffect(() => {
    const { bookings } = loadBookings();
    if (bookings.length > 0) {
      // Map stored bookings to AdminAppointment
      const mapped: AdminAppointment[] = bookings.map((b) => ({
        ...b,
        extendedStatus: (b.status === "processed" ? "completed" : "pending") as any,
      }));
      setAppointments(mapped);
    } else {
      // Default initial mock bookings from Stitch design
      const initialStitchAppointments: AdminAppointment[] = [
        {
          id: "HHD-8924",
          name: "Vũ Đức Toàn",
          phone: "0912 345 678",
          date: "2026-11-28",
          time: "14:00 - 15:00",
          eventType: "Thuê phi cơ & Gala VIP",
          notes: "Đoàn 45 khách cấp cao từ Hà Nội vào Đà Nẵng",
          status: "pending",
          extendedStatus: "pending",
          createdAt: new Date().toISOString(),
        },
        {
          id: "HHD-8923",
          name: "Mai Ngọc Lan",
          phone: "0988 776 211",
          date: "2026-11-28",
          time: "16:30 - 17:30",
          eventType: "Tiệc cưới sân vườn 300 khách",
          notes: "Gói Trọn gói Diamond tại Thảo Điền",
          status: "processed",
          extendedStatus: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "HHD-8921",
          name: "Hoàng Nhật Minh",
          phone: "0904 112 899",
          date: "2026-11-29",
          time: "09:30 - 10:30",
          eventType: "Lễ ra mắt xe điện công nghệ",
          notes: "Doanh nghiệp VinFast Auto, maket 3D sân khấu",
          status: "pending",
          extendedStatus: "pending",
          createdAt: new Date().toISOString(),
        },
        {
          id: "HHD-8919",
          name: "Trần Thu Hằng",
          phone: "0971 556 332",
          date: "2026-10-15",
          time: "10:00 - 11:00",
          eventType: "Hội nghị khách hàng cuối năm",
          notes: "Techcombank Gala Dinner, 500 khách",
          status: "processed",
          extendedStatus: "completed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "HHD-8915",
          name: "Đặng Khắc Tiệp",
          phone: "0933 445 119",
          date: "2026-10-14",
          time: "15:00 - 16:00",
          eventType: "Tiệc kỷ niệm 10 năm công ty",
          notes: "Dời lịch sang Quý 1 năm sau",
          status: "processed",
          extendedStatus: "cancelled",
          createdAt: new Date().toISOString(),
        },
      ];
      setAppointments(initialStitchAppointments);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Status badge helper
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Chờ liên hệ",
          bg: "bg-[#ffdcc3] text-[#6e3900] border-amber-300",
          dot: "bg-[#934e00] animate-ping",
        };
      case "confirmed":
        return {
          label: "Đã xác nhận",
          bg: "bg-[#dae2fd] text-[#131b2e] border-indigo-200",
          dot: "bg-[#4f46e5]",
        };
      case "completed":
        return {
          label: "Hoàn tất",
          bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-600",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          bg: "bg-red-100 text-red-800 border-red-200",
          dot: "bg-red-500",
        };
      default:
        return {
          label: "Chờ xử lý",
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  // Change status of appointment
  const handleUpdateStatus = (id: string, newStatus: "pending" | "confirmed" | "completed" | "cancelled") => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              extendedStatus: newStatus,
              status: newStatus === "completed" || newStatus === "cancelled" ? "processed" : "pending",
            }
          : item
      )
    );
    showToast(`Đã cập nhật trạng thái hẹn #${id} thành công.`);
  };

  const handleDeleteRow = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa cuộc hẹn #${id}?`)) {
      setAppointments((prev) => prev.filter((item) => item.id !== id));
      deleteProcessedBooking(id);
      showToast(`Đã xóa cuộc hẹn #${id}.`);
    }
  };

  const handleExportExcel = () => {
    const headers = ["Mã Hẹn", "Khách Hàng", "Số Điện Thoại", "Nhu Cầu", "Ngày Hẹn", "Khung Giờ", "Trạng Thái", "Ghi Chú"];
    const rows = filteredAppointments.map((a) => [
      `#${a.id}`,
      `"${a.name}"`,
      `"${a.phone}"`,
      `"${a.eventType || 'Tư vấn sự kiện'}"`,
      `"${a.date}"`,
      `"${a.time}"`,
      `"${a.extendedStatus || a.status}"`,
      `"${a.notes || ''}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bao-cao-lich-hen-EventHHD-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Đã xuất file báo cáo Excel (.csv UTF-8) thành công.");
  };

  // FAQs dataset (10 core questions from Stitch Canvas)
  const [faqs, setFaqs] = useState([
    {
      id: "Q1",
      question: "Chi phí tổ chức một sự kiện trọn gói tại EventHHD là bao nhiêu?",
      category: "Báo giá & Chi phí",
      askCount: 412,
      confidence: 98,
      enabled: true,
      answer:
        "Ngân sách tổ chức phụ thuộc vào quy mô, địa điểm và tiêu chuẩn VIP. Gói cơ bản khởi điểm từ 50.000.000 VNĐ, gói Luxury Enterprise từ 250.000.000 VNĐ. Chuyên viên EventHHD sẽ gửi bảng dự toán chi tiết sau 30 phút đặt hẹn.",
      paraphrase:
        "EventHHD cung cấp các giải pháp từ 50 triệu đến các đại nhạc hội trăm triệu. Để em xếp lịch chuyên viên tư vấn gọi ngay nhé?",
    },
    {
      id: "Q2",
      question: "Khách hàng cần đặt cọc trước bao nhiêu % và thanh toán thế nào?",
      category: "Hợp đồng & Kế toán",
      askCount: 328,
      confidence: 99,
      enabled: true,
      answer:
        "Tiến độ thanh toán chia làm 3 đợt: Đợt 1 đặt cọc 40% khi ký kết HĐ nguyên tắc, Đợt 2 thanh toán 40% trước ngày diễn ra sự kiện 7 ngày, và Đợt 3 thanh lý 20% còn lại trong vòng 3 ngày làm việc sau sự kiện.",
      paraphrase:
        "Quy trình thanh toán chia 3 đợt linh hoạt 40% - 40% - 20% có xuất hóa đơn VAT điện tử đầy đủ theo quy định.",
    },
    {
      id: "Q3",
      question: "Thời gian chuẩn bị một sự kiện tiêu chuẩn mất bao lâu?",
      category: "Vận hành & Kịch bản",
      askCount: 295,
      confidence: 97,
      enabled: true,
      answer:
        "Đối với sự kiện quy mô vừa (100 - 300 khách), thời gian lý tưởng là 2 - 3 tuần. Với các đại tiệc Gala hoặc sự kiện ngoài trời quy mô lớn, EventHHD khuyến nghị chuẩn bị từ 4 - 6 tuần để tối ưu chi phí sảnh và xin giấy phép.",
      paraphrase:
        "Thông thường cần từ 2-4 tuần để dàn dựng maket 3D và kịch bản chi tiết. Các trường hợp khẩn cấp có gói Fast-Track 72h.",
    },
    {
      id: "Q4",
      question: "Chính sách bảo hiểm & dự phòng rủi ro thời tiết như thế nào?",
      category: "An toàn & Pháp lý",
      askCount: 260,
      confidence: 99,
      enabled: true,
      answer:
        "Tất cả hợp đồng tại EventHHD đều có gói Bảo hiểm Trách nhiệm Sự kiện trị giá từ 3 đến 10 tỷ VNĐ. Tiệc ngoài trời luôn có phương án B (nhà giàn bạt không gian hoặc sảnh phụ trong nhà) được kích hoạt trước giờ G 4 tiếng nếu thời tiết bất lợi.",
      paraphrase:
        "EventHHD cam kết an toàn tuyệt đối với bảo hiểm 10 tỷ VNĐ và phương án dự phòng thời tiết 2 lớp miễn phí.",
    },
    {
      id: "Q5",
      question: "EventHHD có hỗ trợ MC song ngữ và đạo diễn sân khấu không?",
      category: "Nhân sự & Nghệ sĩ",
      askCount: 245,
      confidence: 96,
      enabled: true,
      answer:
        "Chúng tôi sở hữu mạng lưới MC Đài truyền hình VTV/HTV song ngữ (Anh, Hàn, Nhật, Trung) và đạo diễn nghệ thuật dày dặn kinh nghiệm, đảm bảo chỉn chu run-of-show từng phút.",
      paraphrase:
        "Có MC song ngữ chuyên nghiệp và tổng đạo diễn theo sát từ khâu kịch bản đến tổng duyệt âm thanh.",
    },
    {
      id: "Q6",
      question: "Doanh nghiệp đặt nhiều sự kiện trong năm có ưu đãi gì?",
      category: "Hội viên VIP",
      askCount: 210,
      confidence: 95,
      enabled: true,
      answer:
        "Khách hàng ký hợp đồng khung năm được cấp hạng Thẻ Hội Viên VIP, hưởng chiết khấu 5% - 10% trên toàn bộ các hợp đồng, miễn phí khảo sát địa điểm 3D và ưu tiên giữ ngày đẹp vào mùa cao điểm.",
      paraphrase:
        "Chính sách VIP Member giảm ngay 5-10% và miễn phí nâng cấp gói hiệu ứng ánh sáng laser cao cấp.",
    },
    {
      id: "Q7",
      question: "Danh sách các khách sạn và trung tâm hội nghị 5 sao liên kết?",
      category: "Địa điểm đối tác",
      askCount: 198,
      confidence: 98,
      enabled: true,
      answer:
        "EventHHD là đối tác chiến lược cấp 1 của các chuỗi: The Reverie Saigon, Park Hyatt, Sheraton, JW Marriott, Vinpearl, Furama Resort, đem lại giá sảnh ưu đãi và miễn phí set-up sớm.",
      paraphrase:
        "Chúng em liên kết trực tiếp với 35+ khách sạn 5 sao trên toàn quốc với mức phí sảnh ưu đãi độc quyền.",
    },
    {
      id: "Q8",
      question: "Quy chuẩn an ninh & bảo mật yếu nhân (VIP Summit)?",
      category: "An ninh đặc quyền",
      askCount: 180,
      confidence: 99,
      enabled: true,
      answer:
        "Dành cho các hội nghị tài chính hoặc khách VIP, chúng tôi triển khai cổng từ an ninh, kiểm soát thẻ RFID, đội ngũ vệ sĩ chuyên trách và đường truyền bảo mật riêng biệt.",
      paraphrase:
        "Đội ngũ an ninh tiêu chuẩn quốc tế, bảo mật danh tính khách mời và cấp phép hạ cánh trực thăng theo yêu cầu.",
    },
    {
      id: "Q9",
      question: "Đơn vị có cung cấp dịch vụ ẩm thực (Catering) ngoài trời không?",
      category: "F&B Yến Tiệc",
      askCount: 165,
      confidence: 96,
      enabled: true,
      answer:
        "EventHHD hợp tác với các bếp trưởng Michelin và đơn vị Catering 5 sao chuẩn HACCP, phục vụ từ Finger Food, BBQ sân vườn đến tiệc Sit-down bàn tiệc Fine Dining thượng hạng.",
      paraphrase:
        "Phục vụ yến tiệc lưu động tiêu chuẩn 5 sao với đầy đủ bàn ghế chiavari, sommelier và kiểm định an toàn thực phẩm.",
    },
    {
      id: "Q10",
      question: "Nếu muốn hủy hoặc dời ngày sự kiện thì xử lý thế nào?",
      category: "Chính sách hoàn tiền",
      askCount: 152,
      confidence: 98,
      enabled: true,
      answer:
        "Khách hàng được bảo lưu 100% tiền cọc và dời ngày trong vòng 180 ngày nếu thông báo trước 14 ngày. Trường hợp bất khả kháng theo luật định, EventHHD hoàn lại toàn bộ các chi phí chưa phát sinh.",
      paraphrase:
        "Chính sách bảo lưu cọc linh hoạt 180 ngày không tính phí phạt nếu thông báo trước 2 tuần.",
    },
  ]);

  // Filtered appointments
  const filteredAppointments = appointments.filter((app) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        app.name.toLowerCase().includes(q) ||
        app.phone.includes(q) ||
        app.id.toLowerCase().includes(q) ||
        (app.eventType && app.eventType.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      const currentStatus = app.extendedStatus || app.status;
      if (currentStatus !== statusFilter) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 2 Header */}
      <Header role="admin" />

      {/* Main Workspace */}
      <main className="w-full flex-1 pt-6 pb-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-7">
          {/* Top KPI Summary Row (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-xs text-[#464555]">
                  Tổng lịch hẹn hôm nay
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#4f46e5]">
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="font-headline-lg text-3xl font-extrabold text-slate-900 tracking-tight">
                  12
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-label-md text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+3 so với hôm qua</span>
                </div>
              </div>
              <div className="w-full bg-[#f2f4f6] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-xs text-[#464555]">
                  Chờ xử lý / Cần gọi ngay
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#ffdcc3] flex items-center justify-center text-[#934e00]">
                  <span className="material-symbols-outlined text-[20px]">priority_high</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="font-headline-lg text-3xl font-extrabold text-slate-900 tracking-tight">
                  04
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#6e3900] font-label-md text-[11px] font-bold">
                  Cảnh báo ưu tiên
                </span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#d97706] h-full rounded-full" style={{ width: "38%" }}></div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-xs text-[#464555]">
                  Tỷ lệ Bot giải quyết tự động
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#dae2fd] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="font-headline-lg text-3xl font-extrabold text-slate-900 tracking-tight">
                  86.4%
                </div>
                <span className="font-mono text-xs text-slate-500">142/165 lượt</span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#3525cd] h-full rounded-full" style={{ width: "86.4%" }}></div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-xs text-[#464555]">
                  Lịch hẹn hoàn tất tuần này
                </span>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="font-headline-lg text-3xl font-extrabold text-slate-900 tracking-tight">
                  38
                </div>
                <span className="font-label-md text-xs text-emerald-700 font-semibold">Tỷ lệ chốt 92%</span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
          </div>

          {/* Main Area: Grid 12 cols (8 cols Left tabs + 4 cols Right side panel) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
            {/* Primary Tab Area (8 Cols) */}
            <div className="xl:col-span-8 flex flex-col gap-5">
              {/* Tab Navigation Bar */}
              <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("crm")}
                    className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === "crm"
                        ? "bg-[#4f46e5] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span>Lịch hẹn Khách hàng (CRM)</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-mono">
                      {appointments.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("faq")}
                    className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === "faq"
                        ? "bg-[#4f46e5] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    <span>Bộ kiến thức FAQ cho Bot</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono">
                      {faqs.length}
                    </span>
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f2f4f6] text-slate-600 font-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse"></span>
                  <span>Sync: Live Storage</span>
                </div>
              </div>

              {/* TAB 1: CRM APPOINTMENTS */}
              {activeTab === "crm" && (
                <div className="flex flex-col gap-4">
                  {/* Filter and Action Bar */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      {/* Search box */}
                      <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                          search
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Tìm theo tên khách, SĐT (0912...), mã hẹn #HHD..."
                          className="w-full bg-[#f2f4f6] rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4f46e5] transition-all"
                        />
                      </div>

                      {/* Quick Time Presets */}
                      <div className="flex items-center gap-1 bg-[#f2f4f6] p-1 rounded-lg shrink-0 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setTimeFilter("today")}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            timeFilter === "today" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Hôm nay
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFilter("tomorrow")}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            timeFilter === "tomorrow" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Ngày mai
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFilter("week")}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            timeFilter === "week" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Tuần này
                        </button>
                      </div>

                      {/* Export Excel Button */}
                      <button
                        type="button"
                        onClick={handleExportExcel}
                        className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shrink-0 border border-slate-200"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#4f46e5]">ios_share</span>
                        <span>Xuất Excel</span>
                      </button>
                    </div>

                    {/* Status Filters */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium mr-1">Trạng thái:</span>
                      {[
                        { id: "all", label: `Tất cả (${appointments.length})` },
                        { id: "pending", label: "Chờ liên hệ" },
                        { id: "confirmed", label: "Đã xác nhận" },
                        { id: "completed", label: "Hoàn tất" },
                        { id: "cancelled", label: "Đã hủy" },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStatusFilter(st.id as any)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                            statusFilter === st.id
                              ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                              : "bg-[#f2f4f6] text-slate-600 hover:bg-slate-200 border-slate-200"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Appointments Table */}
                  <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#f2f4f6] text-slate-600 font-semibold border-b border-slate-200">
                            <th className="py-3 px-4">Mã hẹn</th>
                            <th className="py-3 px-4">Khách hàng</th>
                            <th className="py-3 px-4">Nhu cầu tư vấn</th>
                            <th className="py-3 px-4">Thời gian hẹn</th>
                            <th className="py-3 px-4">Trạng thái</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {filteredAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                Không tìm thấy lịch hẹn phù hợp với bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            filteredAppointments.map((row) => {
                              const badge = getStatusBadge(row.extendedStatus || row.status);
                              const initials = row.name
                                .split(" ")
                                .map((w) => w[0])
                                .slice(-2)
                                .join("")
                                .toUpperCase();

                              return (
                                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3.5 px-4 font-mono font-bold text-[#4f46e5]">
                                    #{row.id}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-[#dae2fd] text-[#131b2e] flex items-center justify-center font-bold text-xs shrink-0">
                                        {initials}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{row.name}</p>
                                        <p className="font-mono text-[11px] text-slate-500">{row.phone}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-1.5 text-slate-900 font-medium truncate">
                                      <span className="material-symbols-outlined text-[#4f46e5] text-[16px]">
                                        celebration
                                      </span>
                                      <span>{row.eventType || "Tư vấn sự kiện VIP"}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                                      {row.notes || "Ghi chú tiêu chuẩn"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <p className="font-semibold text-slate-900">{row.date}</p>
                                    <p className="text-[11px] text-[#4f46e5] font-mono">{row.time}</p>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 w-fit border ${badge.bg}`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                      <span>{badge.label}</span>
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {/* Call */}
                                      <a
                                        href={`tel:${row.phone}`}
                                        onClick={() => showToast(`Đang kết nối cuộc gọi tới ${row.name} (${row.phone})...`)}
                                        className="p-1.5 rounded-lg bg-[#f2f4f6] hover:bg-slate-200 text-[#4f46e5] transition-all"
                                        title="Gọi ngay cho khách"
                                      >
                                        <span className="material-symbols-outlined text-[17px]">call</span>
                                      </a>

                                      {/* Mark Confirmed */}
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStatus(row.id, "confirmed")}
                                        className="p-1.5 rounded-lg bg-[#f2f4f6] hover:bg-slate-200 text-emerald-700 transition-all"
                                        title="Xác nhận lịch hẹn"
                                      >
                                        <span className="material-symbols-outlined text-[17px]">check_circle</span>
                                      </button>

                                      {/* Details Modal */}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedBooking(row)}
                                        className="p-1.5 rounded-lg bg-[#f2f4f6] hover:bg-slate-200 text-slate-600 transition-all"
                                        title="Xem chi tiết"
                                      >
                                        <span className="material-symbols-outlined text-[17px]">visibility</span>
                                      </button>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRow(row.id)}
                                        className="p-1.5 rounded-lg bg-[#f2f4f6] hover:bg-red-100 text-red-600 transition-all"
                                        title="Xóa lịch"
                                      >
                                        <span className="material-symbols-outlined text-[17px]">delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer */}
                    <div className="p-3.5 bg-[#f2f4f6] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#4f46e5]">info</span>
                        <span>Đồng bộ tự động từ Chatbot & localStorage.</span>
                      </div>
                      <span>Hiển thị {filteredAppointments.length}/{appointments.length} cuộc hẹn</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FAQ KNOWLEDGE BASE */}
              {activeTab === "faq" && (
                <div className="flex flex-col gap-4">
                  {/* FAQ Header & Action */}
                  <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-headline-sm text-base text-slate-900 font-bold">
                        Bộ kiến thức FAQ dành cho AI Agent
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Huấn luyện mô hình xử lý ngôn ngữ tự nhiên từ 10 kịch bản phản hồi cốt lõi của EventHHD.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFAQ({
                          id: `Q${faqs.length + 1}`,
                          q: "",
                          a: "",
                          category: "Báo giá & Dịch vụ",
                        });
                        setIsEditFAQModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>Thêm câu hỏi FAQ mới</span>
                    </button>
                  </div>

                  {/* FAQ 10 items List */}
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200 space-y-3 hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#dae2fd] text-[#3525cd] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                              {faq.id}
                            </div>
                            <div>
                              <h4 className="font-title-md text-sm text-slate-900 font-bold leading-snug">
                                {faq.question}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1 text-[#4f46e5] font-semibold">
                                  <span className="material-symbols-outlined text-[15px]">repeat</span>
                                  {faq.askCount} lần hỏi
                                </span>
                                <span>Danh mục: {faq.category}</span>
                                <span className="text-amber-700 font-semibold">Độ tin cậy: {faq.confidence}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Controls: toggle & edit */}
                          <div className="flex items-center gap-2 shrink-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={faq.enabled}
                                onChange={() => {
                                  setFaqs((prev) =>
                                    prev.map((f) => (f.id === faq.id ? { ...f, enabled: !f.enabled } : f))
                                  );
                                  showToast(`Đã ${faq.enabled ? "tắt" : "bật"} kịch bản ${faq.id}`);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4f46e5]"></div>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFAQ({
                                  id: faq.id,
                                  q: faq.question,
                                  a: faq.answer,
                                  category: faq.category,
                                });
                                setIsEditFAQModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Chỉnh sửa câu trả lời"
                            >
                              <span className="material-symbols-outlined text-[17px]">edit</span>
                            </button>
                          </div>
                        </div>

                        {/* Standard Answer */}
                        <div className="p-3 rounded-lg bg-[#f2f4f6] text-xs text-slate-800 space-y-1">
                          <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider">
                            Phản hồi tiêu chuẩn:
                          </span>
                          <p className="leading-relaxed">{faq.answer}</p>

                          {/* AI Paraphrase Preview */}
                          <div className="mt-2 pt-2 border-t border-slate-200 flex items-start gap-1.5 bg-white p-2 rounded border border-slate-100">
                            <span className="material-symbols-outlined text-[#4f46e5] text-[16px] shrink-0 mt-0.5">
                              auto_awesome
                            </span>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              <strong className="text-slate-900">AI Paraphrase Preview:</strong> {faq.paraphrase}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Live Stats & Calendar (4 Cols) */}
            <div className="xl:col-span-4 flex flex-col gap-5">
              {/* Upcoming VIP countdown */}
              <div className="bg-gradient-to-br from-indigo-900 to-[#1e1b4b] text-white p-5 rounded-xl shadow-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">timer</span>
                    <span className="font-bold text-xs">Cuộc Hẹn Kế Tiếp</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-bold">
                    Trong 25 phút
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">Vũ Đức Toàn - Đoàn 45 Khách</h4>
                  <p className="text-xs text-indigo-200 mt-0.5">Thuê trực thăng & Gala VIP tại Vinpearl</p>
                  <p className="text-xs text-amber-300 font-mono font-bold mt-2">14:00 - 15:00 Hôm nay</p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <a
                    href="tel:0912345678"
                    className="flex-1 py-2 px-3 rounded-lg bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold text-center flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>Gọi Khách</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBooking(appointments[0]);
                    }}
                    className="py-2 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold"
                  >
                    Hồ Sơ
                  </button>
                </div>
              </div>

              {/* Source Distribution */}
              <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <span className="material-symbols-outlined text-[#4f46e5] text-[18px]">pie_chart</span>
                  <span>Kênh Tiếp Nhận Lịch Hẹn</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>AI Chatbot 24/7 (Website)</span>
                      <span className="font-bold text-slate-900">65% (78)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Hotline SOS 1800 6868</span>
                      <span className="font-bold text-slate-900">25% (30)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Giới thiệu / Trực tiếp</span>
                      <span className="font-bold text-slate-900">10% (12)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Calendar Widget */}
              <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4f46e5] text-[18px]">calendar_today</span>
                    <span>Tháng 11, 2026</span>
                  </span>
                  <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                    Tuần 48
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, idx) => (
                    <span key={idx} className="font-bold text-slate-400 py-1 text-[11px]">
                      {day}
                    </span>
                  ))}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const dayNum = i + 1;
                    const isToday = dayNum === 28;
                    const hasEvent = [28, 29, 30].includes(dayNum);
                    return (
                      <div
                        key={i}
                        className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors relative ${
                          isToday
                            ? "bg-[#4f46e5] text-white font-bold shadow-xs"
                            : hasEvent
                            ? "bg-indigo-50 text-[#3525cd] font-semibold"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {dayNum}
                        {hasEvent && !isToday && (
                          <span className="w-1 h-1 bg-[#4f46e5] rounded-full absolute bottom-1 left-1/2 -translate-x-1/2"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#4f46e5]">#{selectedBooking.id}</span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-slate-900 text-sm">{selectedBooking.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                  <a href={`tel:${selectedBooking.phone}`} className="font-mono font-bold text-[#4f46e5] hover:underline">
                    {selectedBooking.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Thời gian hẹn:</span>
                  <span className="font-semibold">{selectedBooking.date} ({selectedBooking.time})</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Nhu cầu & Gói sự kiện:</span>
                <p className="font-medium text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  {selectedBooking.eventType || "Tư vấn tổng thể"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Ghi chú yêu cầu của khách:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                  {selectedBooking.notes || "Không có ghi chú thêm."}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1.5">Đổi trạng thái:</span>
                <div className="flex flex-wrap gap-2">
                  {(["pending", "confirmed", "completed", "cancelled"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, st);
                        setSelectedBooking({ ...selectedBooking, extendedStatus: st });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        selectedBooking.extendedStatus === st
                          ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                      }`}
                    >
                      {st === "pending"
                        ? "Chờ liên hệ"
                        : st === "confirmed"
                        ? "Xác nhận"
                        : st === "completed"
                        ? "Hoàn tất"
                        : "Hủy lịch"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <a
                href={`tel:${selectedBooking.phone}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Gọi Điện Thoại</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {isEditFAQModalOpen && editingFAQ && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Chỉnh Sửa Bộ Câu Hỏi {editingFAQ.id}</span>
              <button
                type="button"
                onClick={() => setIsEditFAQModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Câu hỏi của khách:</label>
                <input
                  type="text"
                  value={editingFAQ.q}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, q: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Phản hồi tiêu chuẩn:</label>
                <textarea
                  rows={4}
                  value={editingFAQ.a}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, a: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Danh mục:</label>
                <input
                  type="text"
                  value={editingFAQ.category}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditFAQModalOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setFaqs((prev) =>
                    prev.some((f) => f.id === editingFAQ.id)
                      ? prev.map((f) =>
                          f.id === editingFAQ.id
                            ? { ...f, question: editingFAQ.q, answer: editingFAQ.a, category: editingFAQ.category }
                            : f
                        )
                      : [
                          ...prev,
                          {
                            id: editingFAQ.id,
                            question: editingFAQ.q,
                            answer: editingFAQ.a,
                            category: editingFAQ.category,
                            askCount: 1,
                            confidence: 95,
                            enabled: true,
                            paraphrase: editingFAQ.a,
                          },
                        ]
                  );
                  setIsEditFAQModalOpen(false);
                  showToast("Đã lưu cập nhật FAQ thành công.");
                }}
                className="px-4 py-2 rounded-lg bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
