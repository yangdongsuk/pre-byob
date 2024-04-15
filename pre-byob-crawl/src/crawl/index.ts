import { load } from "cheerio";
import db from "../database";
import type { Article, Item } from "../database";
import { log } from "../lib/log";

const getArticles = async (): Promise<Article[]> => {
  const url = "https://www.customs.go.kr/kcs/ad/go/gongMeList.do";

  const data = new FormData();
  data.append("currPage", "1");
  data.append("minSn", "10");
  data.append("searchType", "subject");
  data.append("tcd", "1");
  data.append("maxSn", "20");
  data.append("searchValue", "주류");
  data.append("mberId", "");
  data.append("pageIndex", "10");
  data.append("sysId", "kcs");
  data.append("srchPaging", "50");
  data.append("searchCondition", "4");
  data.append("seq", "");
  data.append("authChk", "false");
  data.append("checkType", "");
  data.append("mi", "2898");

  const html = await fetch(url, {
    method: "post",
    body: data,
  }).then((res) => res.text());

  const $ = load(html);

  return $("table.bbsList tbody tr")
    .map((_, tr) => {
      const el = $(tr);
      const order = Number.parseInt(el.find('td[data-table="number"]').text());
      const no = Number.parseInt(
        el.find('td[data-table="subject"] > a').data("id") as string
      );
      const title = el.find('td[data-table="subject"] > a').text().trim();
      const writer = el.find('td[data-table="write"]').text().trim();
      const date = el.find('td[data-table="date"]').text().trim();

      return {
        no,
        title,
        writer,
        date,
      };
    })
    .toArray();
};

const getItems = async (article: Article): Promise<Item[]> => {
  const url = `https://www.customs.go.kr/kcs/ad/go/gongMeInfo.do?mi=2898`;

  const data = new FormData();
  data.append("searchType", "subject");
  data.append("tcd", "1");
  data.append("searchValue", "주류");
  data.append("mberId", "");
  data.append("sysId", "kcs");
  data.append("srchPaging", "50");
  data.append("seq", article.no.toString());
  data.append("checkType", "");

  const html = await fetch(url, {
    method: "post",
    body: data,
  }).then((res) => res.text());

  const $ = load(html);

  const rows = $("table.basic_table").eq(1).find("tbody > tr");

  let curItem: Partial<Item> = {};
  const items: Item[] = [];
  rows.each((idx, tr) => {
    const el = $(tr);
    if (idx % 3 === 0) {
      curItem = {
        no: el.find("td").eq(0).text().trim(),
        articleNo: article.no,
        price: Number.parseInt(el.find("td").eq(3).text()),
      };
    } else if (idx % 3 === 1) {
      curItem = {
        ...curItem,
        name: el.find("td").eq(0).text().trim(),
        amount: Number.parseInt(el.find("td").eq(1).text()),
      };

      items.push(curItem as Item);
    }
  });

  return items;
};

export default {
  async run() {
    const crawledArticles = await getArticles();

    const savedArticleNos = db.articles.getAll().map((article) => article.no);

    const newArticles = crawledArticles.filter(
      (article) => !savedArticleNos.includes(article.no)
    );
    log(`[crawler] new articles count: ${newArticles.length}`);

    for (const article of newArticles) {
      db.articles.insert(article);
    }

    let newItems: Item[] = [];
    for (const article of newArticles) {
      try {
        const crawledItems = await getItems(article);
        newItems = newItems.concat(crawledItems);
        console.log("cur:", article.title, crawledItems.length);
      } catch (e) {
        log(`[crawler] ${article.no}: ${article.title}`, "ERROR");
      }
    }

    log(`[crawler] crawled new items count: ${newItems.length}`);

    newItems.sort((item1, item2) => item1.name.localeCompare(item2.name));

    return newItems;
  },
};
