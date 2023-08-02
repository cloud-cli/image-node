import { default as superstatic } from "superstatic";
import connect from "connect";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const loadJson = (path) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
const options = loadJson(join(process.cwd(), "superstatic.json"));
const pkg = loadJson(join(process.cwd(), "package.json"));

const env = JSON.stringify(
  Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => key.startsWith("APP_"))
      .map(([key, value]) => [key.replace("APP_", ""), value])
  )
);

async function main() {
  const server = connect();

  server.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}]`, req.method, req.url);
    next();
  });

  server.use("/.env", function (_, res) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(env);
  });

  if (pkg.main) {
    const main = join(process.cwd(), pkg.main);
    server.use(await import(main));
  }

  server.use(superstatic(options));
  server.listen(process.env.PORT, () =>
    console.log("Server started at " + process.env.PORT)
  );
}

main();
