import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { password } = (await req.json()) as { password: string };

    // 환경변수에서 'ENTRANCE_PASSWORD'를 가져와 비교
    const correctPassword = process.env.ENTRANCE_PASSWORD;

    if (password === correctPassword) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // 실패 시 success: false만 반환 (화면 출력용 텍스트 없음)
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
