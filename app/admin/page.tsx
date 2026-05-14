"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// --- 서버 액션 (파일 상단 또는 별도 파일) ---
import { checkAdminPassword } from "./actions.ts";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 1. 서버 액션 호출 (API 주소 필요 없음)
      const isCorrect = await checkAdminPassword(password);

      if (isCorrect) {
        // 2. 로그인 성공 시 쿠키 생성 및 이동
        document.cookie = "admin_auth=true; path=/; max-age=86400";
        router.push("/admin/contents");
      } else {
        alert("비밀번호가 틀렸습니다!");
      }
    } catch (error) {
      alert("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-black mb-6 text-center text-gray-800">
          🔒 ADMIN LOGIN
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all text-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white p-4 rounded-xl font-black active:scale-95 transition-all shadow-lg`}
          >
            {isLoading ? "로그인 중..." : "관리자 접속"}
          </button>
        </form>
      </div>
    </div>
  );
}
