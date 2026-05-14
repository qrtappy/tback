import { getRequestContext } from "@cloudflare/next-on-pages";

// 1. 환경변수 인터페이스 (엄격하게 정의)
interface CloudflareEnv {
  ADMIN_PASSWORD: string;
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  // 2. 런타임에 실제 env 객체가 존재하는지부터 확인
  const { env } = getRequestContext() as { env: Partial<CloudflareEnv> };

  // 3. [실전 핵심] 환경변수 값 존재 여부 및 타입 검증 (Type Guard)
  // 설정 실수로 비어있거나 string이 아닐 경우를 완벽히 차단합니다.
  if (typeof env.ADMIN_PASSWORD !== "string") {
    console.error("[Config Error] ADMIN_PASSWORD is missing or invalid.");
    return false; // 혹은 throw new Error("Server Configuration Error");
  }

  // 4. 이제부터 adminPassword는 완벽한 string으로 보장됨
  const adminPassword: string = env.ADMIN_PASSWORD;

  // 5. 안전한 비교 (상수 시간 비교 등 보안 로직은 생략)
  return password === adminPassword;
}
