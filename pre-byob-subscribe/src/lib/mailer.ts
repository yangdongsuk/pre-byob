import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

const SENDER_EMAIL = "dailydongguk@gmail.com";
const SENDER_APP_PASSWORD = "wyotvfohrvkvmwmp";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD,
  },
});

export default {
  send({ to, subject, html }: SendMailOptions) {
    transport.sendMail({
      to,
      subject,
      html,
    });
  },
};
