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
  articleNo: number;
  no: string;
  price: number;
  name: string;
  amount: number;
}

createSchema({
  drop: true,
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
          "INSERT INTO Items (articleNo, no, price, name, amount) VALUES (@articleNo, @no, @price, @name, @amount)"
        )
        .run(item);
    },
    getAll() {
      return connection.prepare("SELECT * FROM Articles").all() as Item[];
    },
  },
};

export default db;
