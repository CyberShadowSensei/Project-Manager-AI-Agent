import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
