
const SCHED_INTERVAL = 300;

export interface Job {
    readonly Id: string;
    callback(duration: number): Promise<void>;
}

class Scheduler {
    private _jobs: Map<string, Job>;
    private _jobIds: string[];

    private _tickDuration: number;

    constructor() {
        this._jobs = new Map<string, Job>();
        this._jobIds = [];

        this._tickDuration = 0;
    }

    async run() {
        const self = this;
        this._tickDuration = Math.floor(process.uptime() * 1000);
        setImmediate(function _tick() {
            const newUptime = Math.floor(process.uptime() * 1000);
            const duration = newUptime - self._tickDuration;
            self._tickDuration = newUptime;
            (async () => {
                const jobIds = self._jobIds.slice();
                const jobsCopy = new Map<string, Job>();
                self._jobs.forEach((job, key) => jobsCopy.set(key, job));
                for (let key of jobIds) {
                    const job = jobsCopy.get(key)!;
                    try {
                        await job.callback(duration);
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