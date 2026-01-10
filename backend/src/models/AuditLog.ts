import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  project: Types.ObjectId;
  user: string; // Placeholder for now, can be 'AI' or 'System' or 'User'
  action: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: String, default: 'System' },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Index for fast retrieval by project
AuditLogSchema.index({ project: 1, timestamp: -1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
