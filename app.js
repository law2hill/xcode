const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
