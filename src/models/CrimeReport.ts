import mongoose, {Schema, Document} from "mongoose";

mongoose.connect("mongodb://localhost:27017/ShadowReport")

const USER = "user";
const LAW_ENFORCEMENT = "law_enforcement"

export interface Message {
    sender: "user" | "law_enforcement";
    message: string;
    timestamp: Date;
}

export interface CrimeReport extends Document {
    reportId: string;
    description: string;
    location: string;
    status: "Pending" | "Under Investigation" | "Closed";
    evidence?: string[];
    messages: Message[];
    createdAt: Date;

}

const CrimeReportSchema = new Schema<CrimeReport>({
    reportId: {type: String, unique: true, required: true},
    description: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Under Investigation", "Closed"], default: "Pending" },
    evidence: [{ type: String }],
    messages: [
        {
            sender: { type: String, enum: [USER, LAW_ENFORCEMENT] },
            message: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: {type: Date, default: Date.now }
})

export default mongoose.model<CrimeReport>("CrimeReport", CrimeReportSchema);