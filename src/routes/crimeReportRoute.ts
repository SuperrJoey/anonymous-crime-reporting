import express from "express";
import upload from "../middleware/upload";
import cloudinary from "../config/cloudinary";
import CrimeReport from "../models/CrimeReport";

const router = express.Router();


router.post("/", async (req, res) => {
    try {
        const { description, location } = req.body;

        const newReport = new CrimeReport({
            description,
            location
        });

        await newReport.save();

        res.status(201).json({
            message: "Report created successfully",
            reportId: newReport.reportId
        });
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.post("/report/upload", upload.array("evidence", 5), async(req, res) => {
    try {
        const { reportId } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ error: "No files uploaded" });
            return;
        }

        let evidenceUrls: string[] = [];

        const uploadToCloudinary = (fileBuffer: Buffer) => {
            return new Promise<string>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream( {folder: "evidence"}, 
                    (error, result) => {
                        if(error || !result) {
                            reject(error || new Error("upload failed"));
                        } else {
                            resolve(result.secure_url);
                        }
                    });
                    uploadStream.end(fileBuffer);
            })
        }

        for(const file of files) {
           const url = await uploadToCloudinary(file.buffer);
           evidenceUrls.push(url);
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
