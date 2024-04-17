import config from "../lib/config";
import connection from "./connection";
import createSchema from "./createSchema";

export interface Subscriber {
  email: string;
}

export interface Article {
  no: number;
  title: string;
  writer: string;
  date: string;
}

export interface Item {
  imageSrc: string;
  no: string;
  name: string;
  price: string;
}

createSchema({
  drop: config.DB_REFRESH,
});

const db = {
  subscribers: {
    insert(subscriber: Subscriber) {
      return connection
        .prepare("INSERT INTO Subscribers (email) VALUES (@email)")
        .run(subscriber);
    },
    getAll() {
      return connection
        .prepare("SELECT * FROM Subscribers")
        .all() as Subscriber[];
    },
  },
  articles: {
    insert(article: Article) {
      return connection
        .prepare(
          "INSERT INTO Articles (no, title, writer, date) VALUES (@no, @title, @writer, @date)"
        )
        .run(article);
    },
    getAll() {
      return connection.prepare("SELECT * FROM Articles").all() as Article[];
    },
  },
  items: {
    insert(item: Item) {
      return connection
        .prepare(
          "INSERT INTO Items (imageSrc, no, name, price) VALUES (@imageSrc, @no, @name, @price)"
        )
        .run(item);
    },
    getAll() {
      return connection.prepare("SELECT * FROM Items").all() as Item[];
    },
    updatePrice(no: string, newPrice: string) {
      return connection
        .prepare("UPDATE Items SET price = ? WHERE no = ?")
        .run(newPrice, no);
    },
  },
};

export default db;
