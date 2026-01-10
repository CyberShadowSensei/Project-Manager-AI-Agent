import AuditLog from '../models/AuditLog.js';
import { Types } from 'mongoose';

export const logActivity = async (
  projectId: string | Types.ObjectId,
  action: string,
  details: string,
  user: string = 'AI Agent'
) => {
  try {
    const log = new AuditLog({
      project: projectId,
      action,
      details,
      user
    });
    await log.save();
    console.log(`[Audit] ${action} logged for project ${projectId}`);
  } catch (error) {
    console.error('Failed to save audit log:', error);
  }
};
