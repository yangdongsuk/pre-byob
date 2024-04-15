import connection from "./connection";

const createSchema = ({ drop }: { drop: boolean }) => {
  if (drop) {
    // connection.exec(`DROP TABLE IF EXISTS Subscribers;`);
    connection.exec(`DROP TABLE IF EXISTS Articles;`);
    connection.exec(`DROP TABLE IF EXISTS Items;`);
  }

  connection.exec(`
    CREATE TABLE IF NOT EXISTS Subscribers (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        type TEXT
    )`);

  connection.exec(`
    CREATE TABLE IF NOT EXISTS Articles (
        id INTEGER PRIMARY KEY,
        no INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        writer TEXT NOT NULL,
        date TEXT NOT NULL
    )`);

  connection.exec(`
    CREATE TABLE IF NOT EXISTS Items (
        id INTEGER PRIMARY KEY,
        articleNo INTEGER NOT NULL,
        no TEXT NOT NULL UNIQUE,
        price INTEGER NOT NULL,
        name TEXT NOT NULL,
        amount INTEGER NOT NULL
    )
  `);
};

export default createSchema;
