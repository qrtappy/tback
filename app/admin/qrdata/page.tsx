"use client";

import { useState } from "react";

export default function AdminQRDataPage() {
  const [count, setCount] = useState(1);
  const [adminKey, setAdminKey] = useState(""); // 비밀번호 입력 상태 추가
  const [loading, setLoading] = useState(false);
  // image 필드 제거 및 성공 여부 확인을 위한 구조로 변경
  const [results, setResults] = useState<{ id: string; success: boolean }[]>(
    [],
  );

  const generateQRCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/qr/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 헤더 명칭을 ADMIN_PASSWORD로 변경하여 사용자 입력값 전달
          ADMIN_PASSWORD: adminKey,
        },
        body: JSON.stringify({ count }),
      });

      const result = (await response.json()) as {
        success: boolean;
        data: any[];
      };

      if (result.success) {
        // 성공 여부만 저장하도록 데이터 구조 정리
        const newEntry = { id: crypto.randomUUID(), success: true };
        setResults((prev) => [newEntry, ...prev]);
        alert(`${result.data.length}개의 QR이 생성되어 DB에 박제되었습니다.`);
      } else {
        alert("생성에 실패했습니다. 비밀번호를 확인하세요.");
      }
    } catch (error) {
      console.error("생성 오류:", error);
      alert("생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "32px",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. 상단 헤더 영역 (사진 1번 Cloudflare 스타일) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: "#000",
              margin: "0 0 8px 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "24px" }}>📋</span> 큐알 생성
          </h1>
          <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
            새로운 큐알 코드를 생성하고 데이터베이스에 안전하게 박제합니다.
          </p>
        </div>

        {/* 2. 설정 영역 (사진 2번: 갯수조정 + 엔터 버튼) */}
        <div style={{ display: "flex", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                borderRight: "1px solid #ddd",
                backgroundColor: "#f5f5f5",
                color: "#333",
                fontWeight: "500",
              }}
            >
              갯수조정
            </span>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{
                width: "60px",
                border: "none",
                padding: "0 10px",
                fontSize: "14px",
                outline: "none",
                textAlign: "center",
              }}
            />
          </div>
          <button
            onClick={generateQRCodes}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "처리 중..." : "엔터"}
          </button>
        </div>
      </div>

      {/* 3. 검색 바 영역 (사진 2번: 돋보기 찾기) */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="돋보기 찾기"
          style={{
            width: "100%",
            padding: "12px 12px 12px 40px",
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#fff",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#999",
            fontSize: "16px",
          }}
        >
          🔍
        </span>
      </div>

      {/* 4. 리스트 테이블 영역 (사진 1번 하단 테이블 구조) */}
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: "4px",
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #e5e5e5",
                backgroundColor: "#fcfcfc",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "12px 15px",
                  fontWeight: "500",
                  color: "#333",
                  width: "20%",
                }}
              >
                날짜
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  fontWeight: "500",
                  color: "#333",
                  width: "15%",
                }}
              >
                생성갯수
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                성공여부 (ID / 이미지)
              </th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    transition: "background-color 0.1s",
                  }}
                >
                  <td style={{ padding: "12px 15px", color: "#666" }}>
                    {new Date().toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 15px", color: "#666" }}>1</td>
                  <td style={{ padding: "12px 15px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <span
                        style={{
                          color: "#0070f3",
                          fontWeight: "500",
                          fontFamily: "monospace",
                        }}
                      >
                        {item.id}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "14px",
                  }}
                >
                  생성된 내역이 없습니다. '엔터' 버튼을 눌러 생성을 시작하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 5. 푸터 영역 (사진 1번 하단 바) */}
        <div
          style={{
            padding: "12px 15px",
            backgroundColor: "#fcfcfc",
            borderTop: "1px solid #e5e5e5",
            color: "#666",
            fontSize: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            Showing {results.length > 0 ? 1 : 0}-{results.length} of{" "}
            {results.length}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              disabled
              style={{
                padding: "2px 8px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                backgroundColor: "#fff",
                cursor: "not-allowed",
              }}
            >
              &lt;
            </button>
            <button
              disabled
              style={{
                padding: "2px 8px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                backgroundColor: "#fff",
                cursor: "not-allowed",
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
