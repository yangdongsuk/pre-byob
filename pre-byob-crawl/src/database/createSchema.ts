import connection from "./connection";
const createSchema = ({ drop }: { drop: boolean }) => {
  if (drop) {
    console.log("Dropping Tables if they exist.");
    console.log("Executing: DROP TABLE IF EXISTS Subscribers;");
    connection.exec(`DROP TABLE IF EXISTS Subscribers;`);
    console.log("Executing: DROP TABLE IF EXISTS Articles;");
    connection.exec(`DROP TABLE IF EXISTS Articles;`);
    console.log("Executing: DROP TABLE IF EXISTS Items;");
    connection.exec(`DROP TABLE IF EXISTS Items;`);
  }

  console.log("Creating Tables.");
  console.log("Executing: CREATE TABLE IF NOT EXISTS Subscribers ...");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS Subscribers (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        type TEXT
    )`);

  console.log("Executing: CREATE TABLE IF NOT EXISTS Articles ...");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS Articles (
        id INTEGER PRIMARY KEY,
        no INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        writer TEXT NOT NULL,
        date TEXT NOT NULL
    )`);

  console.log("Executing: CREATE TABLE IF NOT EXISTS Items ...");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS Items (
        id INTEGER PRIMARY KEY,
        imageSrc TEXT NOT NULL,
        number TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price TEXT NOT NULL
    )
  `);
};

export default createSchema;
