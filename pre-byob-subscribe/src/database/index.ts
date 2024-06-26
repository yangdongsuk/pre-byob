import config from "../lib/config";
import connection from "./connection";
import createSchema from "./createSchema";

export interface Subscriber {
  email: string;
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
    getByEmail(email: string) {
      return connection
        .prepare("SELECT * FROM Subscribers WHERE email = @email")
        .get({ email }) as Subscriber;
    },
    getAll() {
      return connection
        .prepare("SELECT * FROM Subscribers")
        .all() as Subscriber[];
    },
  },
};

export default db;
