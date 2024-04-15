import db from "./database";
import crawl from "./crawl";
import mailer from "./lib/mailer";
import { log } from "./lib/log";

async function main() {
  const newItems = await crawl.run();

  if (newItems.length === 0) {
    return;
  }

  const html = newItems
    .map(
      (item) =>
        `글 번호: ${item.articleNo} / 공매 번호: ${item.no}<br>
        ${item.name}<br>
        ${item.price.toLocaleString()} 원 / ${item.amount} 개`
    )
    .join("<br><br>");

  const targets = db.subscribers.getAll();
  targets.forEach(({ email }) => {
    mailer.send({
      to: email,
      subject: `[주류 공매 알림] ${newItems[0].name} 외 ${
        newItems.length - 1
      } 건`,
      html,
    });
    log(`[crawler] email sended to ${email}`, "INFO");
  });
}

main();
