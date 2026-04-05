import path from "path";
import Server from "./config/server";

const server = new Server({
  baseDir: path.join(__dirname),
  modelsDir: path.join(__dirname, "config/models"),
  publicDir: path.join(__dirname, "config/server/public"),
});

server.start();
