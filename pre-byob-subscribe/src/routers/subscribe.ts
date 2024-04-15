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

      // 메일 인증용 JWT
      const token = verifyToken.generate(email);
      log(`${req.path} - 메일 인증용 JWT: ${token}`);

      // 인증 메일 전송
      mailer.send({
        to: email,
        subject: "인증 테스트 메일임",
        html: `
      <a href="${config.BASE_URL}/subscribe/verify/${token}">메일 인증</a>
      `,
      });
      log(`${req.path} - 인증 요청 메일 전송: ${email}`);

      return res.json({
        message: "전송!",
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
      subject: "인증 성공 메일",
      html: `성공함 ㅇㅇ`,
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
