
const SCHED_INTERVAL = 300;

export interface Job {
    readonly Id: string;
    doJob(duration: number): Promise<void>;
}

class Scheduler {
    private _jobs: Map<string, Job>;
    private _jobIds: string[];

    private _lastTick: number;

    constructor() {
        this._jobs = new Map<string, Job>();
        this._jobIds = [];

        this._lastTick = 0;
    }

    async run() {
        const self = this;
        self._lastTick = Math.floor(process.uptime() * 1000);
        setImmediate(function _tick() {
            const now = Math.floor(process.uptime() * 1000);
            const tickDuration = now - self._lastTick;
            self._lastTick = now;
            (async () => {
                const jobIds = self._jobIds.slice();
                const jobs = new Map<string, Job>();
                self._jobs.forEach((job, key) => jobs.set(key, job));
                for (let key of jobIds) {
                    const job = jobs.get(key)!;
                    try {
                        await job.doJob(tickDuration);
                    } catch (error) {
                        console.log(`job[${job.Id}] error: ${error.toString()}`);
                    }
                }
            })()
                .then(() => setTimeout(_tick, SCHED_INTERVAL))
                .catch(error => {
                    console.log("scheduler catch:", error.toString());
                    setTimeout(_tick, SCHED_INTERVAL);
                });
        });
    }

    registerJob(job: Job) {
        if (this._jobs.has(job.Id)) {
            return;
        }

        this._jobs.set(job.Id, job);
        this._jobIds.push(job.Id);
    }

    removeJob(jobId: string) {
        if (this._jobs.has(jobId)) {
            this._jobs.delete(jobId);
            const findIdx = this._jobIds.findIndex(id => id === jobId);
            this._jobIds.splice(findIdx, 1);
        }
    }
}

export default Scheduler;