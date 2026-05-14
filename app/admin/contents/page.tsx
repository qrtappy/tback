// app/admin/contents/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Link as LinkIcon, Save } from "lucide-react";

export default function AdminContents() {
  const [stickers, setStickers] = useState({
    urls: Array(12).fill(""),
    links: Array(12).fill(""),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin")
      .then((res) => res.json())
      .then((data: any) => {
        if (data && data.stickers) {
          setStickers(data.stickers);
        }
      }); // <--- 여기 중괄호 하나, 괄호 하나, 세미콜론 필수
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await fetch("/api/admin", {
      method: "POST",
      body: JSON.stringify({ type: "stickers", data: stickers }),
    });
    setLoading(false);
    alert("모든 스티커 설정이 저장되었습니다!");
  };

  const updateField = (
    index: number,
    field: "urls" | "links",
    value: string,
  ) => {
    const newData = { ...stickers };
    newData[field][index] = value;
    setStickers(newData);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ImageIcon className="text-purple-600" /> 스티커 & 링크 관리
        </h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg"
        >
          <Save size={20} /> 전체 저장하기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                Sticker #{i + 1}
              </span>
              {stickers.urls[i] && (
                <img
                  src={stickers.urls[i]}
                  alt="미리보기"
                  className="w-10 h-10 object-contain rounded-md border"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  placeholder="이미지 경로 (예: /s1.png)"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={stickers.urls[i]}
                  onChange={(e) => updateField(i, "urls", e.target.value)}
                />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  placeholder="연결될 URL (https://...)"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={stickers.links[i]}
                  onChange={(e) => updateField(i, "links", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
