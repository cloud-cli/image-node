const superstatic = require("superstatic").default;
const connect = require("connect");
const staticsJson = require("path").join(process.cwd(), "superstatic.json");
const packageJson = require("path").join(process.cwd(), "package.json");
const options = require(staticsJson);
const pkg = require(packageJson);

const env = JSON.stringify(
  Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => key.startsWith("APP_"))
      .map(([key, value]) => [key.replace("APP_", ""), value])
  )
);

const server = connect();

server.use("/.env", function (_, res) {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(env);
});

if (pkg.main) {
  server.use(require(pkg.main));
}

server.use(superstatic(options));
server.listen(process.env.PORT, () => console.log("Server started at " + process.env.PORT));
