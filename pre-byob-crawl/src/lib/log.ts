import fs from "fs";

type LogLevel = "INFO" | "FATAL" | "ERROR";

const log = (message: string, type: LogLevel = "INFO") => {
  const line = `[${type}] [${new Date().toISOString()}] ${message}\n`;

  if (!fs.existsSync("../logs")) {
    fs.mkdirSync("../logs");
  }

  if (!fs.existsSync("../logs/log.txt")) {
    fs.writeFileSync("../logs/log.txt", "");
  }

  console.log(line);
  fs.appendFileSync("../logs/log.txt", line);
};

export { log };
