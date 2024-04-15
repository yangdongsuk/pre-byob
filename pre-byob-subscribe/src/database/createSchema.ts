import connection from "./connection";

const createSchema = ({ drop }: { drop: boolean }) => {
  if (drop) {
    connection.exec(`DROP TABLE IF EXISTS Subscribers;`);
  }

  connection.exec(`
    CREATE TABLE IF NOT EXISTS Subscribers (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        type TEXT
    )`);
};

export default createSchema;
