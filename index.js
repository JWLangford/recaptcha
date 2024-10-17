import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import querystring from "querystring";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index.html");

  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      return res.status(500).send("Error reading HTML file");
    }

    const modifiedHtml = html.replace(/{{API_KEY}}/g, process.env.API_KEY);
    res.send(modifiedHtml);
  });
});

app.post("/submit", async (req, res) => {
  const recaptchaURL = "https://www.google.com/recaptcha/api/siteverify";

  const data = querystring.stringify({
    secret: process.env.API_SECRET,
    response: req.body.token,
  });

  try {
    const resp = await axios.post(recaptchaURL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log(resp.data);

    res.send({
      message: `<ul> <li> ${resp.data.success} </li> <li> ${resp.data.challenge_ts} </li> <li> ${resp.data.hostname} </li> <li> ${resp.data.score} </li> <li> ${resp.data.action} </li> </ul>`,
    });
  } catch (error) {
    console.error("Error making HTTP request:", error);
    res.status(500).send("An error occurred.");
  }
});

app.listen(process.env.PORT, () =>
  console.log(`App is listening on port ${process.env.PORT}`)
);
