import { v4 as uuidv4 } from 'uuid';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: string;
  data: any;
  status: JobStatus;
  result?: any;
  error?: string;
  createdAt: number;
}

class JobQueueService {
  private jobs: Map<string, Job> = new Map();

  constructor() {
    // Optional: Cleanup old jobs periodically
    setInterval(() => this.cleanup(), 1000 * 60 * 60); // Every hour
  }

  addJob(type: string, data: any, processor: (data: any) => Promise<any>): string {
    const id = uuidv4();
    const job: Job = {
      id,
      type,
      data,
      status: 'pending',
      createdAt: Date.now()
    };

    this.jobs.set(id, job);

    // Start processing asynchronously (fire and forget)
    this.processJob(id, processor);

    return id;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  private async processJob(id: string, processor: (data: any) => Promise<any>) {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'processing';
    this.jobs.set(id, job);

    try {
      const result = await processor(job.data);
      job.status = 'completed';
      job.result = result;
    } catch (error: any) {
      console.error(`Job ${id} failed:`, error);
      job.status = 'failed';
      job.error = error.message || 'Unknown error';
    } finally {
      this.jobs.set(id, job);
    }
  }

  private cleanup() {
    const now = Date.now();
    const TTL = 1000 * 60 * 30; // 30 minutes retention
    for (const [id, job] of this.jobs.entries()) {
      if (now - job.createdAt > TTL) {
        this.jobs.delete(id);
      }
    }
  }
}

export const jobQueue = new JobQueueService();
