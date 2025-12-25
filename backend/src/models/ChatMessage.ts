import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
  project: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient retrieval by project, sorted by time
ChatMessageSchema.index({ project: 1, createdAt: 1 });

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
export default ChatMessage;
