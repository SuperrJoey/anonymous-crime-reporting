import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crimeReportRoute from "./routes/crimeReportRoute";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/api/reports", crimeReportRoute);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Something went wrong!" });
});

