import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  // New fields for Context-Aware AI
  context?: string; // Aggregated text from uploaded files
  assets?: {
    name: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];
}

const AssetSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  context: { type: String, default: '' },
  assets: { type: [AssetSchema], default: [] }
});

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
