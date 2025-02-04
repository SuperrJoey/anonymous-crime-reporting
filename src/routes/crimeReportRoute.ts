import express from "express";
import upload from "../middleware/upload";
import cloudinary from "../config/cloudinary";
import CrimeReport from "../models/CrimeReport";

const router = express.Router();

router.post("/report/upload", upload.array("evidence", 5), async(req, res) => {
    try {
        const { reportId } = req.body;
        const files = req.files as Express.Multer.File[];

        let evidenceUrls: string[] = [];

        for(const file of files) {
            const result = await cloudinary.uploader.upload_stream(
                { folder: "evidence" },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        res.status(500).json({ error: "Upload failed" });
                        return;
                    }
                    if(result) evidenceUrls.push(result.secure_url);
                }
            );
            result.end(file.buffer);
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
