var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("lib/mailer", ["require", "exports", "nodemailer"], function (require, exports, nodemailer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    nodemailer_1 = __importDefault(nodemailer_1);
    const SENDER_EMAIL = "dailydongguk@gmail.com";
    const SENDER_APP_PASSWORD = "wyotvfohrvkvmwmp";
    const transport = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_APP_PASSWORD,
        },
    });
    exports.default = {
        send({ to, subject, html }) {
            transport.sendMail({
                to,
                subject,
                html,
            });
        },
    };
});
define("index", ["require", "exports", "./database"], function (require, exports, database_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    database_1 = __importDefault(database_1);
    database_1.default.subscribers.insert({ email: "bdu00chch@gmail.com" });
    console.log(database_1.default.subscribers.getAll());
});
define("database/connection", ["require", "exports", "better-sqlite3"], function (require, exports, better_sqlite3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    better_sqlite3_1 = __importDefault(better_sqlite3_1);
    const db = new better_sqlite3_1.default("foobar.db", {});
    db.pragma("journal_mode = WAL");
    exports.default = db;
});
define("database/createSchema", ["require", "exports", "database/connection"], function (require, exports, connection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    connection_1 = __importDefault(connection_1);
    const createSchema = () => {
        connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS Subscribers (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        type TEXT
    )`);
        connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS CrawledDatas (
        id INTEGER PRIMARY KEY,
        type TEXT NOT NULL
    )`);
    };
    exports.default = createSchema;
});
define("database/index", ["require", "exports", "database/connection", "database/createSchema"], function (require, exports, connection_2, createSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    connection_2 = __importDefault(connection_2);
    createSchema_1 = __importDefault(createSchema_1);
    (0, createSchema_1.default)();
    exports.default = {
        subscribers: {
            insert(subscriber) {
                connection_2.default.prepare("INSERT INTO Subscribers (email) VALUES (@email)").run(subscriber);
            },
            getAll() {
                connection_2.default.prepare("SELECT id, email FROM Subscribers").get();
            },
        },
    };
});
