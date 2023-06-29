const superstatic = require("superstatic").default;
const connect = require("connect");
const staticsJson = require("path").join(process.cwd(), "superstatic.json");
const options = require(staticsJson);

const env = JSON.stringify(
  Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => key.startsWith("APP_"))
      .map(([key, value]) => [key.replace("APP_"), value])
  )
);

connect()
  .use("/.env", function (_, res) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(env);
  })
  .use(superstatic(options))
  .listen(process.env.PORT, function () {
    console.log("Server started at " + process.env.PORT);
  });
