import express from "express";
import dotenv from "dotenv";
import Routes from "./routes";

dotenv.config();
if (!process.env.PORT) {
  process.exit(1);
}

const PORT = process.env.PORT || 8080;

const app = express();

app.use(Routes);

app.get("/", (req, res) => {
  res.send("Welcome to mkulima digital");
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
