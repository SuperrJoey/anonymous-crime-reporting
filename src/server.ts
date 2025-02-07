import express from "express";
import dotenv from "dotenv";
import crimeReportRoute from "./routes/crimeReportRoute";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/api/reports", crimeReportRoute);

mongoose
    .connect("mongodb://localhost:27017/ShadowReport")
    .then(() => { console.log("Connected to mongodb"); })
    .catch((err) => console.error("database connection error:", err));


mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
})

mongoose.connection.once("open", () => {
    console.log("Database connection is open and ready")
})

    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Something went wrong!" });
});

console.log("Server Starting..!");

app.listen(3000);