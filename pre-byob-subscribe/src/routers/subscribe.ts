import express from "express";
import type { Express, Request, Response } from "express";
import mailer from "../lib/mailer";
import verifyToken from "../lib/verifyToken";
import db from "../database";
import { log } from "../lib/log";
import config from "../lib/config";

interface RegisterRequestBody {
  email: string;
}

const router = express.Router();

router.post(
  "/request",
  (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    try {
      const { email } = req.body;

      // 이메일 중복 처리
      const existing = db.subscribers.getByEmail(email);
      if (existing) {
        return res.status(400).json({
          message: "이미 구독한 이메일입니다.",
        });
      }

      // 메일 인증용 JWT
      const token = verifyToken.generate(email);
      log(`${req.path} - 메일 인증용 JWT: ${token}`);

      // 인증 메일 전송
      mailer.send({
        to: email,
        subject: "[주류 공매 알림] 메일 인증",
        html:
          "[TODO]: 이메일 템플릿 사용<br><br>" +
          `메일 인증을 완료해주세요!<br>
          <a href="${config.BASE_URL}/subscribe/verify/${token}" style="display:inline-block; padding: 0.5rem 1rem; border-radius: 5px; background-color: #0ea5e9; color: #ffffff; text-decoration: none;">메일 인증</a>`,
      });
      log(`${req.path} - 인증 요청 메일 전송: ${email}`);

      return res.json({
        message: "인증 메일이 전송되었습니다!",
      });
    } catch (ex) {
      log(`${req.path} - 에러: ${ex}`, "ERROR");

      return res.status(400).json({
        message: "에러!",
      });
    }
  }
);

router.get("/verify/:token", (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // JWT 토큰 검증
    const { email } = verifyToken.verify(token);

    // [TODO]: 검증 성공 시, DB에 구독자 명단 추가
    db.subscribers.insert({ email });
    log(`${req.path} - 사용자 구독: ${email}`);

    // 구독 성공 확인 메일 전송
    mailer.send({
      to: email,
      subject: "[주류 공매 알림] 인증 성공!",
      html:
        "[TODO]: 이메일 템플릿 사용<br><br>" +
        `이메일 인증이 완료되었습니다!<br><br>
        새로운 주류 공매가 공시되면, 이 이메일로 알림을 보내드립니다.`,
    });
    log(`${req.path} - 인증 성공 메일 전송: ${email}`);

    console.log(db.subscribers.getAll());

    return res.redirect("/verified.html");
  } catch (ex) {
    log(`${req.path} - 에러: ${ex}`, "ERROR");

    return res.status(400).json({
      message: "에러!",
    });
  }
});

export default router;
