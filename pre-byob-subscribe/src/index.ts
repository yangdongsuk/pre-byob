import express, { Express, Request, Response } from "express";
import subscribe from "./routers/subscribe";

const app: Express = express();
const port = 3001;

app.use(express.static("static"));
app.use(express.json());

app.use("/subscribe", subscribe);

app.listen(port, () => {
  //
});
