import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  project: Types.ObjectId;
  name: string;
  owner: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  description?: string;
  dependsOn?: Types.ObjectId | null;
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true, trim: true },
  owner: { type: String, required: true },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date, required: true },
  description: { type: String, trim: true },
  dependsOn: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
