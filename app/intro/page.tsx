"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    // 2초(2000ms) 동안 노란 화면 유지 후 리시브 페이지로 이동
    const timer = setTimeout(() => {
      router.push("/receive");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#f2c94c", // 1번 그림의 노란색 배경
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* 상단 텍스트 */}
      <p
        style={{
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "bold",
          margin: "0 0 10px 0",
          letterSpacing: "1px",
        }}
      >
        YOUR SECRET QRCODE
      </p>

      {/* 로고 텍스트 */}
      <h1
        style={{
          color: "#ffffff",
          fontSize: "48px",
          fontWeight: "900",
          fontStyle: "italic",
          margin: "0 0 40px 0",
          letterSpacing: "-2px",
        }}
      >
        TAPTAPQR
      </h1>

      {/* 중앙 캐릭터 이미지 (지시하신 1번 그림 구성) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "60px",
        }}
      >
        <img
          src="/main22.png"
          alt="Characters"
          style={{ width: "240px", height: "auto" }}
        />
      </div>

      {/* 하단 안내 문구 */}
      <div style={{ color: "#ffffff", lineHeight: "1.6" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            margin: "0 0 10px 0",
            fontStyle: "italic",
          }}
        >
          Download now
        </h2>
        <p
          style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 5px 0" }}
        >
          protect your privacy.
        </p>
        <p style={{ fontSize: "13px", margin: "0" }}>
          Print your QR and use it anywhere.
        </p>
        <p style={{ fontSize: "13px", margin: "0" }}>
          Auto-deleted in 24 hours.
        </p>
      </div>
    </div>
  );
}
