import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Routes from "./routes";

dotenv.config();
if (!process.env.PORT) {
  process.exit(1);
}

const csrfMiddleware = csrf({ cookie: true });
const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(csrfMiddleware);

app.use(Routes);

// app.all("*", (req, res, next) => {
//   res.cookie("XSRF-TOKEN", req.csrfToken());
//   next();
// });

app.get("/", (req, res) => {
  res.send("Welcome to mkulima digital");
});

const options = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.set("useFindAndModify", false);
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@alxcluster.n1mxs.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, options)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  )
  .catch((error) => {
    throw error;
  });
