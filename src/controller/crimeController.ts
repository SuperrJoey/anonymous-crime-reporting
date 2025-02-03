import { Request, Response } from "express";
import CrimeReport from "../models/CrimeReport";
import { v4 as uuidv4 } from "uuid";

export const createReport = async (req: Request, res: Response) => {
    try {
        const { description, location } = req.body;

        if (!description || !location) {
            return res.status(400).json({
                error: "Description and location are required to file a report"
            })
        }
        const reportId = uuidv4();

        const evidence = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];

        await CrimeReport.create({
            reportId,
            description,
            evidence,
            location
        })
        res.json({
            message: "content added"
        }) 
    } catch (error) {
        res.status(500).json({
            error: "Failed to add content"
        })
    }
}

export const getReportById = async (req: Request, res: Response) => {
    try {
        const report = await CrimeReport.findOne({ id : req.params.id});
         if(!report) {
            return res.status(404).json({
                error: "Report not found"
            })
         }
    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch the report"
        })
    }
}