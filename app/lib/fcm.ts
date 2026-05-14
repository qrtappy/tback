// 1. 파이어베이스 import 제거 (Cloudflare D1을 사용하기 위함)
import { D1Database } from "@cloudflare/workers-types";

export async function sendPushNotification(
  db: D1Database, // 워커에서 env.DB를 넘겨받아야 합니다
  targetId: string,
  payload: { title: string; body: string; image?: string },
  fcmServerKey: string, // env.FCM_SERVER_KEY를 넘겨받습니다
) {
  try {
    // 2. [D1 DB 조회] 파이어베이스 대신 우리 DB에서 토큰을 찾습니다.
    const { results } = await db
      .prepare("SELECT token FROM push_tokens WHERE userId = ?")
      .bind(targetId)
      .all<{ token: string }>();

    if (!results || results.length === 0) {
      console.log("알림을 보낼 토큰이 없습니다.");
      return;
    }

    const tokens = results.map((row) => row.token);

    // 3. [전송] 구글 FCM 서버로 직접 쏩니다 (기존 로직 유지)
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.image,
          sound: "default",
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          type: "PHOTO_RECEIVED",
        },
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("푸시 알림 전송 실패:", error);
  }
}
