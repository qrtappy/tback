import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

if (process.env.NODE_ENV === "development") {
  setupDevPlatform({
    configPath: "./wrangler.json", // JSON 파일을 직접 지정해서 연결
  }).catch((err) => {
    console.error("Cloudflare Dev Platform setup failed:", err);
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기존 설정들...
};

export default nextConfig;
