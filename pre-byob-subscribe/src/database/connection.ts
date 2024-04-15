import Database from "better-sqlite3";

const connection = new Database("../sqlite/byob.db", {});

connection.pragma("journal_mode = WAL");

export default connection;
