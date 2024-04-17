import run from "./crawl/index";
import db from "./database";
import { log } from "./lib/log";
import mailer from "./lib/mailer";
async function main() {
  const newItems = await run();

  if (newItems.length === 0) {
    log("[crawler] No new items found", "INFO");
    return;
  }

  const baseUri = "https://www.utong.or.kr/Shop/Shop/View.asp?S_NUM=";
  const html =
    "새로운 상품 목록:<br><br>" +
    newItems
      .map(
        (item) =>
          `<img src="${
            item.imageSrc
          }" alt="Item Image" style="height:100px;"><br>
         <a href="${baseUri}${item.no}" target="_blank">공매 번호: ${
            item.no
          }(상세 페이지 바로 가기)</a><br>
         상품명: ${item.name}<br>
         가격: ${parseInt(item.price).toLocaleString()} 원`
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
    log(`[crawler] Email sent to ${email}`, "INFO");
  });
}

main();
