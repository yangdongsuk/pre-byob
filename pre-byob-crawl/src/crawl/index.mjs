import { load } from "cheerio";
import fetch from "node-fetch";

const getItems = async (page) => {
  const url = `https://www.utong.or.kr/Shop/Shop/list.asp?page=${page}&CTC_LCODE=05`;

  const html = await fetch(url).then((res) => res.text());

  const $ = load(html);

  const items = [];

  $("ul > li").each((_, li) => {
    const el = $(li);
    const imageSrc = el.find(".image img").attr("src") || "";
    const number = el.find("p").eq(0).text().trim();
    const name = el.find("p").eq(1).text().trim();
    const price = el.find(".price strong").text().trim();

    items.push({
      imageSrc,
      number,
      name,
      price,
    });
  });

  return items;
};

const run = async () => {
  let allItems = [];

  for (let page = 1; page <= 10; page++) {
    // 페이지를 변경해가며 크롤링
    const items = await getItems(page);
    allItems = allItems.concat(items);
  }

  // 여기서 allItems를 원하는 대로 활용할 수 있습니다.
  console.log(allItems);
};

run();
export default { run };
