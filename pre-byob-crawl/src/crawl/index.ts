import axios from "axios";
import { load } from "cheerio";
import iconv from "iconv-lite";

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

async function run() {
  console.log("Crawling started");
  const initialUrl =
    "https://www.utong.or.kr/Shop/Shop/list.asp?page=1&CTC_LCODE=05";
  const lastPage = await getLastPageNumber(initialUrl);
  let allItems: any[] = [];

  for (let page = 1; page <= lastPage; page++) {
    const items = await getItems(page);
    allItems = allItems.concat(items);
  }

  console.log(allItems);
  return allItems;
}

// run();
export default run;
