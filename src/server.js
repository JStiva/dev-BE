import express from "express";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import homeRoutes from "./routes/homeRoutes.js";
import { initializeCronJobs, fetchDataAndStore } from "./sudregWorker.js";

const app = express();

// for initial data fetching, cron runs once a day because sudski registar is updated once a day
fetchDataAndStore();
initializeCronJobs();

app.use(cors());
const PORT = process.env.PORT || 5001;

// middleware
app.use(express.json());

// get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

app.use("/registar", homeRoutes);

app.listen(PORT, () => {
  return console.log("Server listens");
});
