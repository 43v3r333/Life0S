/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Background Job Queue Engine: Priortized, Scheduled, BullMQ-equivalent Processing
 */

export interface BackgroundJob {
  id: string;
  name: string;
  payload: any;
  priority: "low" | "medium" | "high" | "critical";
  status: "queued" | "active" | "completed" | "failed" | "delayed";
  progress: number; // 0 to 100
  attempts: number;
  maxRetries: number;
  runAt?: string; // Scheduled UTC ISO Date
  cronExpression?: string; // e.g. "*/5 * * * *"
  error?: string;
  createdAt: string;
}

export type JobProcessor = (job: BackgroundJob, updateProgress: (progress: number) => void) => Promise<void>;

export class BackgroundJobEngine {
  private readonly _queue: BackgroundJob[] = [];
  private readonly _processors = new Map<string, JobProcessor>();
  private readonly _deadLetterQueue: BackgroundJob[] = [];
  private _workerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startWorker();
  }

  /**
   * Enqueues a new background operation
   */
  public enqueue(
    name: string,
    payload: any,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      maxRetries?: number;
      delaySeconds?: number;
      cronExpression?: string;
    } = {}
  ): BackgroundJob {
    const runAt = options.delaySeconds
      ? new Date(Date.now() + options.delaySeconds * 1000).toISOString()
      : undefined;

    const job: BackgroundJob = {
      id: "job_" + Math.random().toString(36).substring(2, 9),
      name,
      payload,
      priority: options.priority || "medium",
      status: runAt ? "delayed" : "queued",
      progress: 0,
      attempts: 0,
      maxRetries: options.maxRetries ?? 3,
      runAt,
      cronExpression: options.cronExpression,
      createdAt: new Date().toISOString()
    };

    this._queue.push(job);
    console.log(`[BACKGROUND JOB] Enqueued job: "${name}" [ID: ${job.id}, Priority: ${job.priority}]`);
    return job;
  }

  /**
   * Registers a callback executor for a specific named job task type
   */
  public registerProcessor(name: string, processor: JobProcessor): void {
    this._processors.set(name, processor);
    console.log(`[BACKGROUND JOB] Registered execution worker processor for: "${name}"`);
  }

  /**
   * Retrieves the background jobs currently in the system queue
   */
  public getJobs(): readonly BackgroundJob[] {
    return this._queue;
  }

  public getDeadLetterJobs(): readonly BackgroundJob[] {
    return this._deadLetterQueue;
  }

  /**
   * Evaluates jobs in the queue, prioritizes them, and processes them sequentially
   */
  private startWorker() {
    if (this._workerInterval) return;

    this._workerInterval = setInterval(async () => {
      // Find eligible job to execute
      const now = new Date();
      
      // Update delayed jobs that are ready to run
      for (const job of this._queue) {
        if (job.status === "delayed" && job.runAt && new Date(job.runAt) <= now) {
          job.status = "queued";
        }
      }

      const activeJob = this._queue.find(j => j.status === "active");
      if (activeJob) return; // Wait until current active job completes (single-worker concurrency limit)

      // Find highest priority queued job
      const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
      const nextJob = this._queue
        .filter(j => j.status === "queued")
        .sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority] || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

      if (!nextJob) return;

      await this.processJob(nextJob);
    }, 1500);
  }

  private async processJob(job: BackgroundJob): Promise<void> {
    const processor = this._processors.get(job.name);
    
    if (!processor) {
      console.warn(`[BACKGROUND JOB] No registered worker found for job name: "${job.name}". Postponing.`);
      job.status = "delayed";
      job.runAt = new Date(Date.now() + 10000).toISOString(); // retry mapping in 10s
      return;
    }

    job.status = "active";
    job.attempts++;
    console.log(`[BACKGROUND JOB] [START] Executing job: "${job.name}" [ID: ${job.id}, Attempt ${job.attempts}/${job.maxRetries + 1}]`);

    try {
      const updateProgress = (progress: number) => {
        job.progress = Math.min(100, Math.max(0, Math.round(progress)));
        console.log(`[BACKGROUND JOB] Progress update [ID: ${job.id}]: ${job.progress}%`);
      };

      await processor(job, updateProgress);
      
      job.status = "completed";
      job.progress = 100;
      console.log(`[BACKGROUND JOB] [COMPLETED] Job resolved successfully: [ID: ${job.id}]`);
      
      // If it's a recurring job, schedule the next iteration
      if (job.cronExpression) {
        this.rescheduleRecurringJob(job);
      } else {
        // Remove completed job from the active queue array to prevent leaks
        const idx = this._queue.findIndex(j => j.id === job.id);
        if (idx !== -1) this._queue.splice(idx, 1);
      }
    } catch (err: any) {
      job.error = err.message || "Unknown Job Execution Error";
      console.error(`[BACKGROUND JOB] [FAILED] Job failed [ID: ${job.id}] | Error: ${job.error}`);

      if (job.attempts <= job.maxRetries) {
        job.status = "delayed";
        // Exponential backoff reschedule
        const waitSecs = Math.pow(2, job.attempts) * 3;
        job.runAt = new Date(Date.now() + waitSecs * 1000).toISOString();
        console.log(`[BACKGROUND JOB] Rescheduling failed job for retry in ${waitSecs} seconds.`);
      } else {
        job.status = "failed";
        console.error(`[BACKGROUND JOB] [DEAD LETTER QUEUE] Job completely failed. Moving to DLQ: [ID: ${job.id}]`);
        this._deadLetterQueue.push({ ...job });
        
        // Remove from active queue
        const idx = this._queue.findIndex(j => j.id === job.id);
        if (idx !== -1) this._queue.splice(idx, 1);
      }
    }
  }

  private rescheduleRecurringJob(job: BackgroundJob): void {
    // Standard 5-minute recurring simulation interval for standard Cron Expressions
    job.status = "delayed";
    job.progress = 0;
    job.attempts = 0;
    job.runAt = new Date(Date.now() + 300 * 1000).toISOString(); // 5-minute schedule interval
    console.log(`[BACKGROUND JOB] Scheduled recurring job next iteration for: ${job.runAt}`);
  }

  public shutdown(): void {
    if (this._workerInterval) {
      clearInterval(this._workerInterval);
      this._workerInterval = null;
    }
  }
}

export const backgroundJobEngine = new BackgroundJobEngine();
export default backgroundJobEngine;
