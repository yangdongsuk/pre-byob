import axios from "axios";
import { load } from "cheerio";
import iconv from "iconv-lite";
import db from "../database";
interface RunResult {
  newItems: Item[];
  updatedItems: UpdatedItem[];
}

interface Item {
  imageSrc: string;
  no: string;
  name: string;
  price: string;
}

interface UpdatedItem extends Item {
  previousPrice: string;
}

const getItems = async (page: number): Promise<any[]> => {
  console.log(`[crawler] page ${page} start`);
  const url = `https://www.utong.or.kr/Shop/Shop/list.asp?page=${page}&CTC_LCODE=05`;

  const response = await axios.get(url, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
  });

  const html = iconv.decode(Buffer.from(response.data), "EUC-KR");
  const $ = load(html);
  let items: any[] = [];

  $(".product-list ul > li").each((_, li) => {
    const el = $(li);
    const baseUri = "https://www.utong.or.kr";
    const imagePath = el.find(".image img").attr("src") || "";
    const imageSrc = imagePath ? `${baseUri}${imagePath}` : "";
    const no = el.find("p").eq(0).text().trim();
    const name = el.find("p").eq(1).text().trim();
    const price = el.find(".price strong").text().trim().replace(/[원,]/g, ""); // Regex to remove '원' and commas

    if (imageSrc && no && name && price) {
      items.push({
        imageSrc,
        no,
        name,
        price,
      });
    }
  });

  return items;
};

const getLastPageNumber = async (url: string): Promise<number> => {
  const response = await axios.get(url);
  const html = response.data;
  const $ = load(html);

  const lastPageLink = $(".paginate a").not(".pre, .next").last().attr("href");
  if (!lastPageLink || lastPageLink === "#") {
    return parseInt($(".paginate strong").text(), 10);
  } else {
    const match = lastPageLink.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }
};
async function run(): Promise<RunResult> {
  console.log("Crawling started");

  const initialUrl =
    "https://www.utong.or.kr/Shop/Shop/list.asp?page=1&CTC_LCODE=05";
  const lastPage = await getLastPageNumber(initialUrl);
  let allItems: any[] = [];

  // 페이지 별 아이템 수집
  for (let page = 1; page <= lastPage; page++) {
    const items = await getItems(page);
    allItems = allItems.concat(items);
  }

  // 데이터베이스에서 기존 아이템들 가져오기
  const savedItems = db.items.getAll();
  const savedItemNos = savedItems.map((item) => item.no);

  // 새로운 아이템 필터링
  const newItems = allItems.filter((item) => !savedItemNos.includes(item.no));

  // 가격이 변경된 아이템 필터링
  const updatedItems = allItems
    .filter((item) =>
      savedItems.some(
        (savedItem) =>
          savedItem.no === item.no && savedItem.price !== item.price
      )
    )
    .map((item) => {
      const savedItem = savedItems.find(
        (savedItem) => savedItem.no === item.no
      );
      return {
        ...item,
        previousPrice: savedItem?.price || "Unknown",
      };
    });

  // 새로운 아이템 데이터베이스에 저장
  for (const item of newItems) {
    db.items.insert(item);
  }

  // 가격이 변경된 아이템 업데이트
  for (const item of updatedItems) {
    db.items.updatePrice(item.no, item.price);
  }

  console.log(`New items: ${newItems.length}`);
  console.log(`Updated items: ${updatedItems.length}`);

  return { newItems, updatedItems };
}

// run();
export default run;
