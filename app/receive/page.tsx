"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface LogItem {
  id: string;
  src: string;
  displayTime?: string;
  timestamp?: number;
}

export default function ReceivePage() {
  // 1. 상태 관리 (State)
  const [id, setId] = useState<string>("");
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [viewDetail, setViewDetail] = useState<string | null>(null);

  // useRef 선언 추가
  const isLongPress = useRef(false);
  const timerRef = useRef<number | null>(null);

  const hiddenLogs: string[] =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hidden_logs") || "[]")
      : [];

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  // 2. 초기 설정 및 강제 고정 (보안) 생략...

  // 3. 인증 처리 함수 (최초/자동 공용)
  const handleAuth = async (inputPw: string, isAuto: boolean = false) => {
    if (!inputPw) return;
    if (!isAuto && !email) return;

    if (!isAuto && navigator.vibrate) navigator.vibrate(50);

    try {
      const res = await fetch("/api/qr/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email, password: inputPw }),
      });

      if (res.ok) {
        const data = (await res.json()) as LogItem[];

        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "default") {
            Notification.requestPermission();
          }
        }
        // 데이터 필터링 및 정렬 로직을 함수 내부로 통합
        const newLogs = data
          .filter((log: LogItem) => !hiddenLogs.includes(log.id))
          .sort(
            (a: LogItem, b: LogItem) =>
              (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0),
          )
          .slice(0, 5);

        setLogs(newLogs);
        setIsAuthenticated(true);
        localStorage.setItem(`auth_${id}`, inputPw);
        localStorage.setItem("my_room_id", id);
        localStorage.setItem("owner_logs", JSON.stringify(newLogs));
      } else {
        setAuthError(true);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  const toggleSelect = (id: string) => {
    triggerHaptic();
    setSelectedIds((prev: string[]) =>
      prev.includes(id)
        ? prev.filter((selectedId: string) => selectedId !== id)
        : [...prev, id],
    );
  };

  const handlePointerDown = (id: string) => {
    isLongPress.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      setIsDeleteMode(true);
      toggleSelect(id);
    }, 500);
  };

  const handlePointerUp = async (e: React.PointerEvent, log: LogItem) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (isLongPress.current) {
      e.preventDefault();
      return;
    }

    if (isDeleteMode) {
      toggleSelect(log.id);
    } else {
      triggerHaptic();
      try {
        await fetch(`/api/receive/update?id=${log.id}&status=delivered`, {
          method: "POST",
        });
      } catch {
        // API 업데이트 실패 처리
      }
      setViewDetail(log.src);
    }
  };

  const handleDelete = () => {
    triggerHaptic();
    if (selectedIds.length === 0) return;
    const updatedLogs = logs.filter(
      (l: LogItem) => !selectedIds.includes(l.id),
    );
    setLogs(updatedLogs);
    const currentHidden: string[] = JSON.parse(
      localStorage.getItem("hidden_logs") || "[]",
    );
    localStorage.setItem(
      "hidden_logs",
      JSON.stringify([...currentHidden, ...selectedIds]),
    );
    setSelectedIds([]);
    setIsDeleteMode(false);
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 select-none">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col relative shadow-xl overflow-hidden">
        <div className="p-6 pb-2 flex justify-center items-center relative z-10">
          <div className="w-full bg-gray-100 rounded-full px-4 py-2 border border-gray-200 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-mono truncate">
              {currentUrl}
            </span>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="grow flex flex-col items-center justify-center p-8 bg-white z-[60]">
            <div className="w-full max-w-[320px] flex flex-col items-center">
              {/* 이메일 입력 박스 추가 */}
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  triggerHaptic();
                  setEmail(e.target.value);
                }}
                className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all mb-4 shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
                placeholder="ID ADDRESS"
              />
              <input
                type="text"
                value={password}
                onChange={(e) => {
                  triggerHaptic();
                  setPassword(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAuth(password)}
                className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all mb-8 shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
                placeholder="PASSWORD"
              />
              <button
                onClick={() => handleAuth(password)}
                className="w-[65px] h-[65px] border-[3px] border-black rounded-full flex items-center justify-center group hover:bg-black active:bg-black transition-all duration-300 active:scale-90 shadow-md"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="stroke-black group-hover:stroke-white group-active:stroke-white transition-colors"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              {authError && (
                <p className="text-red-500 text-[10px] mt-6 font-bold tracking-tight">
                  INVALID PASSWORD. PLEASE TRY AGAIN.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            className="grow flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
            onScroll={(e) => {
              const target = e.currentTarget;
              // 오른쪽 끝까지 밀었는지 확인 (숫자가 작을수록 끝에 가깝습니다)
              if (
                target.scrollLeft + target.clientWidth >=
                target.scrollWidth - 10
              ) {
                // 맞다면 저장소(storage) 페이지로 이동
                window.location.href = "/storage";
              }
            }}
          >
            <div className="min-w-full snap-start p-4 grid grid-cols-4 grid-rows-5 gap-2 h-fit">
              {logs.map((log) => (
                <div
                  key={log.id}
                  onPointerDown={() => handlePointerDown(log.id)}
                  onPointerUp={(e) => handlePointerUp(e, log)}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border transition-all select-none [-webkit-tap-highlight-color:transparent] ${
                    selectedIds.includes(log.id)
                      ? "ring-2 ring-[#F9D015] scale-95"
                      : ""
                  }`}
                >
                  <Image
                    src={log.src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                    {log.displayTime}
                  </div>
                  {isDeleteMode && (
                    <div className="absolute top-1 left-1 w-6 h-6 rounded-full border-2 border-white bg-black/20 flex items-center justify-center">
                      {selectedIds.includes(log.id) && (
                        <div className="w-4 h-4 bg-[#F9D015] rounded-full text-[10px] flex items-center justify-center font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewDetail && (
          <div className="fixed inset-0 bg-white/95 z-[40] flex flex-col items-center justify-center p-4 pb-32">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic();
                setViewDetail(null);
              }}
              className="absolute top-10 right-8 w-12 h-12 bg-gray-200/50 rounded-full text-2xl font-bold z-[110] flex items-center justify-center active:scale-90"
            >
              ✕
            </button>
            <div
              className="relative w-full h-full max-w-[430px]"
              onClick={() => setViewDetail(null)}
            >
              <Image
                src={viewDetail}
                alt=""
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}

        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-gray-100 flex justify-between items-center px-10 py-6 z-50">
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
              if (isAuthenticated) {
                setIsDeleteMode(false);
                setSelectedIds([]);
              }
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
