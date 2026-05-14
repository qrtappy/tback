export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { KVNamespace, R2Bucket } from "@cloudflare/workers-types";
import { getRequestContext } from "@cloudflare/next-on-pages";

interface Env {
  AUTH_KV: KVNamespace;
  MY_R2: R2Bucket;
  FIREBASE_SERVICE_ACCOUNT: string;
}

export async function POST(
  request: Request,
  { params, env }: { params: any; env: Env },
) {
  try {
    // 수신 데이터 타입 정의 및 적용
    const { id, email, password, cursor } = (await request.json()) as {
      id: string;
      email: string;
      password: string;
      cursor?: string; // cursor 추가
    };
    // Cloudflare 환경 등에서 env 추출 (플랫폼별 커스텀 대응)
    const { env } = getRequestContext() as unknown as { env: Env };
    const AUTH_KV = env.AUTH_KV;
    const MY_R2 = env.MY_R2; // 아래쪽 env?.MY_R2 부분도 이 변수로 대체됩니다.

    if (!AUTH_KV)
      return NextResponse.json({ error: "KV 설정 필요" }, { status: 500 });

    const validStatus = await AUTH_KV.get(`valid_${id}`);
    if (validStatus !== "active") {
      return NextResponse.json(
        { error: "등록되지 않은 QR입니다." },
        { status: 403 },
      );
    }

    const roomKey = `room_${id}`;
    const existingData = await AUTH_KV.get(roomKey);

    // 데이터가 존재할 경우 JSON 파싱, 없으면 빈 객체 생성
    const qrData = existingData ? JSON.parse(existingData) : null;

    // [핵심 로직] 비밀번호가 없거나 비어있으면 박제 (최초 등록)
    if (!qrData || !qrData.password || qrData.password === "") {
      await AUTH_KV.put(roomKey, JSON.stringify({ email, password }));
      console.log(`ID: ${id} 에 새로운 비밀번호가 박제되었습니다.`);

      return NextResponse.json([], { status: 200 }); // 최초 등록 시 빈 배열 반환
    }

    // [대조 단계] 이미 박제된 비번이 있다면 입력값과 일치하는지 확인
    else {
      if (password === qrData.password) {
        // 비밀번호 일치 시 R2에서 12장 가져오기
        const listed = await MY_R2.list({
          limit: 12,
          prefix: `${id}/`,
          cursor,
        });

        // 사진 데이터 전송
        return NextResponse.json({
          photos: listed.objects,
          nextCursor: listed.truncated ? listed.cursor : null,
        });
      } else {
        // 비밀번호 불일치 시 차단
        return NextResponse.json(
          {
            error:
              "비밀번호가 일치하지 않습니다. 주인이 아니면 접속할 수 없습니다.",
          },
          { status: 401 },
        );
      }
    }
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
