"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface QRItem {
  id: string;
  url: string;
  memo: string;
  index: number;
}

export default function StoragePage() {
  const initialBoxes = Array.from({ length: 15 }, (_, i) => ({
    id: `empty-${i}`,
    url: "",
    memo: "",
    index: i + 1,
  }));

  const [qrList, setQrList] = useState<QRItem[]>(initialBoxes);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const isLongPress = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("my_qr_storage");
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = initialBoxes.map(
        (box) => parsed.find((p: QRItem) => p.index === box.index) || box,
      );
      setQrList(merged);
    }
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const saveToLocal = (newList: QRItem[]) => {
    const onlyData = newList.filter((item) => item.url !== "");
    localStorage.setItem("my_qr_storage", JSON.stringify(onlyData));
    setQrList(newList);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (isDeleteMode) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newList = qrList.map((item) =>
          item.index === index
            ? {
                ...item,
                url: reader.result as string,
                id: Date.now().toString(),
              }
            : item,
        );
        if (index === qrList.length) {
          const nextBoxes = Array.from({ length: 9 }, (_, i) => ({
            id: `empty-${qrList.length + i}`,
            url: "",
            memo: "",
            index: qrList.length + i + 1,
          }));
          saveToLocal([...newList, ...nextBoxes]);
        } else {
          saveToLocal(newList);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelect = (id: string) => {
    triggerHaptic();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handlePointerDown = (id: string) => {
    isLongPress.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setIsDeleteMode(true);
      toggleSelect(id);
    }, 500);
  };

  const handlePointerUp = (id: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isLongPress.current) return;
    if (isDeleteMode) toggleSelect(id);
  };

  const handleDelete = () => {
    triggerHaptic();
    if (selectedIds.length === 0) return;
    const newList = qrList.map((item) =>
      selectedIds.includes(item.id)
        ? { ...item, url: "", memo: "", id: `empty-${item.index}` }
        : item,
    );
    saveToLocal(newList);
    setSelectedIds([]);
    setIsDeleteMode(false);
  };

  const handleResetAll = () => {
    if (confirm("모든 저장 내역을 초기화하시겠습니까?")) {
      localStorage.removeItem("my_qr_storage");
      setQrList(initialBoxes);
      setSelectedIds([]);
      setIsDeleteMode(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-white antialiased select-none">
      <div className="w-full max-w-[430px] bg-white flex flex-col relative shadow-2xl overflow-hidden text-black">
        <div className="px-6 mt-10 mb-4">
          <div className="w-full bg-[#F2F2F7] rounded-2xl py-2 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              QR Management System
            </span>
          </div>
        </div>

        <div
          className="flex-grow overflow-y-auto p-6 pt-2 pb-32 no-scrollbar"
          onScroll={(e) => {
            const target = e.currentTarget;
            // 왼쪽 끝까지 밀었는지 확인 (스크롤이 5 이하로 가면 왼쪽 끝)
            if (target.scrollLeft <= 5) {
              // 맞다면 리시브(receive) 페이지로 이동
              window.location.href = "/receive";
            }
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            {qrList.map((item) => (
              <div key={item.index} className="flex flex-col">
                <div
                  onPointerDown={() => handlePointerDown(item.id)}
                  onPointerUp={() => handlePointerUp(item.id)}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`relative w-full aspect-square bg-gray-50 rounded-2xl transition-all border cursor-pointer overflow-hidden [-webkit-tap-highlight-color:transparent]
                    ${selectedIds.includes(item.id) ? "ring-2 ring-[#F9D015] scale-95" : "border-gray-100"}
                  `}
                >
                  {!isDeleteMode && (
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, item.index)}
                    />
                  )}

                  {item.url ? (
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-2xl font-light">
                      +
                    </div>
                  )}

                  {isDeleteMode && (
                    <div className="absolute top-1 left-1 w-6 h-6 rounded-full border-2 border-white bg-black/20 flex items-center justify-center z-20">
                      {selectedIds.includes(item.id) && (
                        <div className="w-4 h-4 bg-[#F9D015] rounded-full text-[10px] flex items-center justify-center font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1 px-1">
                  <span className="text-[10px] font-black text-gray-300">
                    {item.index}
                  </span>
                  <input
                    className="flex-1 text-[9px] font-light text-gray-400 bg-transparent border-none outline-none"
                    value={item.memo}
                    placeholder="Memo..."
                    onChange={(e) => {
                      const newList = qrList.map((q) =>
                        q.index === item.index
                          ? { ...q, memo: e.target.value }
                          : q,
                      );
                      saveToLocal(newList);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-gray-100 flex justify-between items-center px-10 py-6 z-50 h-[80px]">
          <button
            onClick={() => {
              triggerHaptic();
              isDeleteMode
                ? (setIsDeleteMode(false), setSelectedIds([]))
                : window.history.back();
            }}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <Image src="/icon6.png" alt="" fill className="object-contain" />
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setIsDeleteMode(false);
              setSelectedIds([]);
            }}
            className="w-[30px] h-[30px] relative active:scale-90"
          >
            <Image src="/ICON2.png" alt="" fill className="object-contain" />
          </button>

          <button
            onClick={handleDelete}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <Image src="/ICON4.png" alt="" fill className="object-contain" />
          </button>
        </div>
      </div>
    </div>
  );
}
