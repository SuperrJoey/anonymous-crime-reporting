import express from "express";
import upload from "../middleware/upload";
import cloudinary from "../config/cloudinary";
import CrimeReport from "../models/CrimeReport";
import fs from "fs";
import util from "util";

const router = express.Router();
const unlinkFile = util.promisify(fs.unlink);

router.post("/report/upload", upload.array("evidence", 5), async(req, res) => {
    try {
        const { reportId } = req.body;
        const files = req.files as Express.Multer.File[];

        let evidenceUrls: string[] = [];

        const uploadToCloudinary = (filePath: string) => {
            return new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload(filePath, {folder: "evidence"}, (error, result) => {
                    if(error || !result) {
                        reject(error || new Error("upload failed"));
                    } else {
                        resolve(result.secure_url);
                    }
                })
            })
        }

        for(const file of files) {
           const url = await uploadToCloudinary(file.path);
           evidenceUrls.push(url);
           await unlinkFile(file.path);
        }

        const updatedReport = await CrimeReport.findOneAndUpdate(
            { reportId },
            { $push: { evidence: { $each: evidenceUrls }}},
            { new: true }
        );

        if (!updatedReport) {
            res.status(404).json({ error: "Crime report not found" });
            return;
        }

        res.json({ message: "Evidence uploaded successfully", report: updatedReport });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
