import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { KVNamespace } from "@cloudflare/workers-types";

export const runtime = "edge";

interface Env {
  AUTH_KV: KVNamespace;
}

// 1. 저장된 스티커 데이터 불러오기 (GET)
export async function GET() {
  try {
    const { env } = getRequestContext() as unknown as { env: Env };

    // KV에서 'admin_stickers' 키로 저장된 데이터를 가져옵니다.
    const data = await env.AUTH_KV.get("admin_stickers");

    if (!data) {
      // 저장된 데이터가 없으면 기본값(빈 배열 12개)을 보냅니다.
      return NextResponse.json({
        stickers: {
          urls: Array(12).fill(""),
          links: Array(12).fill(""),
        },
      });
    }

    return NextResponse.json({ stickers: JSON.parse(data) });
  } catch (error) {
    return NextResponse.json({ error: "불러오기 실패" }, { status: 500 });
  }
}

// 2. 수정한 스티커 데이터 저장하기 (POST)
export async function POST(req: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: Env };
    const body = (await req.json()) as { type: string; data: any };

    // 'stickers' 데이터를 JSON 문자열로 변환하여 KV에 저장합니다.
    if (body.type === "stickers") {
      await env.AUTH_KV.put("admin_stickers", JSON.stringify(body.data));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
