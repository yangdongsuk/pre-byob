import run from "./crawl/index";
import db from "./database";
import { log } from "./lib/log";
import mailer from "./lib/mailer";

async function main() {
  const { newItems, updatedItems } = await run();

  if (newItems.length === 0 && updatedItems.length === 0) {
    log("[crawler] No new or updated items found", "INFO");
    return;
  }

  const baseUri = "https://www.utong.or.kr/Shop/Shop/View.asp?S_NUM=";

  const newItemsHtml = newItems
    .map(
      (item) =>
        `<img src="${item.imageSrc}" alt="Item Image" style="height:100px;"><br>
     <a href="${baseUri}${item.no}" target="_blank">공매 번호: ${
          item.no
        }(상세 페이지 바로 가기)</a><br>
     상품명: ${item.name}<br>
     가격: ${parseInt(item.price).toLocaleString()} 원`
    )
    .join("<br><br>");

  const updatedItemsHtml = updatedItems
    .map(
      (item) =>
        `<img src="${item.imageSrc}" alt="Item Image" style="height:100px;"><br>
         <a href="${baseUri}${item.no}" target="_blank">공매 번호: ${
          item.no
        }(상세 페이지 바로 가기)</a><br>
         상품명: ${item.name}<br>
         이전 가격: ${parseInt(item.previousPrice).toLocaleString()} 원<br>
         변경된 가격: ${parseInt(item.price).toLocaleString()} 원`
    )
    .join("<br><br>");

  const html = `새로운 상품 목록:<br><br>${newItemsHtml}<br><br>가격이 변경된 상품 목록:<br><br>${updatedItemsHtml}`;

  const targets = db.subscribers.getAll();
  targets.forEach(({ email }) => {
    mailer.send({
      to: email,
      subject: `[주류 공매 알림] ${newItems[0]?.name || "상품 업데이트"} 외 ${
        newItems.length + updatedItems.length - 1
      } 건`,
      html,
    });
    log(`[crawler] Email sent to ${email}`, "INFO");
  });
}

main();
