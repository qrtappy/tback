// 지시하신 wrangler.jsonc 설정에 맞춘 타입 정의 파일입니다.
interface Env {
  AUTH_KV: KVNamespace;
  MY_R2: R2Bucket;
  DB: D1Database;
}
