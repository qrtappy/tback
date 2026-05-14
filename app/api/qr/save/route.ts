export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { D1Database } from "@cloudflare/workers-types";
import { NextResponse } from "next/server";
import qrcode from "qrcode-generator";

// ★ POST 함수로 전체를 감싸야 합니다.
export async function POST(req: Request) {
  const { env } = getRequestContext() as unknown as {
    env: {
      DB: D1Database;
      qrphoto: R2Bucket; // R2 추가
      AUTH_KV: KVNamespace; // 1. KV 바인딩 추가
      NEXT_PUBLIC_SITE_URL: string; // 환경변수 추가
    };
  };
  const DB = env.DB;
  const AUTH_KV = env.AUTH_KV;

  try {
    // 1. 요청 데이터 확인 (사장님이 화면에서 보낸 count 사용, 없으면 1개)
    interface QRRequest {
      count?: number;
    }
    const body = (await req.json().catch(() => ({}))) as QRRequest;
    const count = body.count || 1;

    const statements = [];
    const generatedData = [];
    const kvPromises = []; // 2. KV
    const origin = env.NEXT_PUBLIC_SITE_URL || "https://taptapq.com";

    // 2. 반복 생성 로직 (비동기 처리 완벽 대기
    for (let i = 0; i < count; i++) {
      const uniqueId =
        crypto.randomUUID().split("-")[0].toUpperCase() +
        Date.now().toString(36).toUpperCase();

      const uniqueUrl = `${origin}/send?id=${uniqueId}`;

      // [핵심] 순수 JS로 QR 패턴 계산 (Node.js API 의존성 없음)
      interface QRCodeInstance {
        addData(data: string): void;
        make(): void;
        createDataURL(cellSize?: number, margin?: number): string;
      }
      const qr = (
        qrcode as unknown as (
          type: number,
          errorCorrectionLevel: string,
        ) => QRCodeInstance
      )(0, "L");
      qr.addData(uniqueUrl); // 이거 없으면 깡통 큐알 됩니다.
      qr.make(); // 이거 없으면 서버 에러 나서 멈춥니다.

      // [핵심] await를 사용하여 이미지가 완전히 생성될 때까지 기다림 (뜸 들이기)
      const qrDataUrl = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(qr.createDataURL(10, 2));
        }, 100); // 의도적인 딜레이를 주어 생성을 확실히 보장
      });

      // 3. DB 쿼리 준비
      statements.push(
        DB.prepare(
          "INSERT INTO [main-qr] (uniqueId, qrImage, status, createdAt) VALUES (?, ?, ?, ?)",
        ).bind(uniqueId, qrDataUrl, "active", new Date().toISOString()),
      );
      kvPromises.push(AUTH_KV.put(`valid_${uniqueId}`, "active"));

      // [핵심] 성공 코드를 위해 배달 가방에 데이터 담기
      generatedData.push({
        id: uniqueId,
        image: qrDataUrl,
      });
    }

    // 4. DB 일괄 박제 (Batch)
    await DB.batch(statements);
    // R2에 실제 이미지 파일로 저장하는 코드
    await Promise.all([
      DB.batch(statements), // DB 박제
      ...kvPromises, // KV 유효 아이디 박제
      ...generatedData.map((item) =>
        env.qrphoto.put(
          `qrphoto/${item.id}.png`,
          new Uint8Array(
            atob(item.image.split(",")[1])
              .split("")
              .map((c) => c.charCodeAt(0)),
          ),
          { httpMetadata: { contentType: "image/png" } },
        ),
      ),
    ]);

    // 5. [결정적 차이] 화면으로 데이터 직접 배달 (qrImage 포함)
    return NextResponse.json(
      {
        success: true,
        message: `${count}개의 QR 코드가 DB에 박제되었습니다.`,
        data: generatedData, // ★ 이제 화면(AdminQRDataPage)에 목록이 뜹니다.
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 내부 오류 발생" },
      { status: 500 },
    );
  }
}
