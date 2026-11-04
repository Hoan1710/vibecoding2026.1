"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { useAuth } from "@/hooks/useAuth";

export default function UserLoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [name, setName] = useState("Nguyễn Thanh Tuấn");
  const [phone, setPhone] = useState("0912345678");
  const [email, setEmail] = useState("khachhang@gmail.com");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập họ và tên của Quý khách.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(cleanPhone)) {
      setError("Số điện thoại không hợp lệ (10 số, đầu số Việt Nam).");
      return;
    }

    setIsLoading(true);
    loginUser(name, cleanPhone, email);

    setTimeout(() => {
      router.push("/");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold text-xl shadow-xs">
              <span className="material-symbols-outlined text-[28px]">person</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Đăng Nhập Khách Hàng
            </h1>
            <p className="text-xs text-slate-500">
              Đăng nhập để theo dõi lịch hẹn tư vấn và nhận báo giá ưu đãi từ EventViet
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Họ và tên Quý khách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email nhận kịch bản & báo giá (Không bắt buộc)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>{isLoading ? "Đang xác thực..." : "Tiếp Tục Trải Nghiệm"}</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 font-medium"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                <span>Quay lại trang chủ tư vấn</span>
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
