export const runtime = "edge";
import { D1Database, R2Bucket, KVNamespace } from "@cloudflare/workers-types";
import { NextResponse } from "next/server";
import { sendPushNotification } from "../../lib/fcm";
import { getRequestContext } from "@cloudflare/next-on-pages";

interface Env {
  DB: D1Database;
  MY_R2: R2Bucket;
  AUTH_KV: KVNamespace;
  R2_PUBLIC_URL: string;
}

export async function POST(req: Request) {
  const { env } = getRequestContext() as unknown as { env: Env };

  try {
    const { image, targetId, password } = (await req.json()) as {
      image: string;
      targetId: string;
      password: string;
    };

    if (!image || !targetId) {
      return NextResponse.json({ message: "Data missing" }, { status: 400 });
    }

    // 1. 파일명 생성
    const fileName = `photos/${targetId}/${Date.now()}.jpg`;

    // 2. R2에 이미지 업로드
    await env.MY_R2.put(fileName, image);

    // 3. 통합된 photo_records 테이블에 기록 (status, createdAt은 DB에서 자동 생성)
    await env.DB.prepare(
      "INSERT INTO photo_records (uniqueId, fileName) VALUES (?, ?)",
    )
      .bind(targetId, fileName)
      .run();

    // 4. 푸시 알림 전송 (이미지 URL 조립)
    const r2Url = env.R2_PUBLIC_URL || "https://taptapq.com";
    const payloadUrl = `${r2Url}/${fileName}`;

    await sendPushNotification(
      env.DB,
      targetId,
      {
        title: "알림",
        body: "새로운 사진이 등록되었습니다.",
        image: payloadUrl,
      },
      process.env.FCM_SERVER_KEY || "",
    );

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
