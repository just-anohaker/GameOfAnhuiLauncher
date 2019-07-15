
import { Job } from "./scheduler";
import ETMDapp from "./etm-http/etm-dapp";
import TimeOfTower from "./timeoftower-http/timeoftower";
import timeline from "./timeline";
import secrets from "./config/secrets";

type UpdateResult = Period | undefined;

const trCheckDuration = 5000;

class SecretRandomer {
    static getSecret() {
        const count = secrets.length;
        const random = Math.floor(Math.random() * count);

        return secrets[random];
    }
}

function getTime() {
    const t = new Date();
    const y = t.getFullYear(), m = t.getMonth(), d = t.getDate(),
        h = t.getHours(), mm = t.getMinutes(), s = t.getSeconds();
    return `${y}-${m}-${d} ${h}:${mm}:${s}`;
}

interface Period {
    update(duration: number): Promise<UpdateResult>;
}

abstract class PeriodStatus implements Period {
    protected _name?: string;
    protected _dapp: ETMDapp;
    protected _id: string;
    protected _tr: string;
    protected _trBlocked: boolean;
    protected _trElapsedTime: number;
    protected _trDuration: number;

    constructor(id: string, tr: string = "", trBlock: boolean = false) {
        this._dapp = new ETMDapp();
        this._id = id;
        this._tr = tr;
        this._trBlocked = trBlock;
        this._trDuration = 0;
        this._trElapsedTime = 0;
    }

    protected reset(tr: string = "", blocked: boolean = false, duration: number = 0, interval: number = 0): void {
        this._tr = tr;
        this._trBlocked = blocked;
        this._trDuration = duration;
        this._trElapsedTime = interval;
    }

    async update(duration: number): Promise<UpdateResult> {
        let result: UpdateResult = undefined;
        try {
            do {
                if (this._tr === "") {
                    const startPeriod = await this.period(this._id);
                    this.reset(startPeriod.transactionId);
                    console.log(`[${this._name} ${getTime()}]submit transaction:${this._id}, ${startPeriod.transactionId}`);
                } else if (!this._trBlocked) {
                    if (this._trElapsedTime < trCheckDuration) {
                        this._trElapsedTime += duration;
                        break;
                    }
                    this._trElapsedTime = duration;
                    const isTrBlock = await this._dapp.isTransactionBlocked(this._tr);
                    console.log(`[${this._name} ${getTime()}] check transaction: ${this._tr} - ${isTrBlock}`);
                    if (!isTrBlock) {
                        const isTrUnconfirmed = await this._dapp.isTransactionUnconfirmed(this._tr);
                        console.log(`[${this._name} ${getTime()}] check unconfirmed transaction: ${this._tr} - ${isTrUnconfirmed}`);
                        if (!isTrUnconfirmed) {
                            this.reset();
                        }
                        break;
                    }
                    this.reset(this._tr, true, 0);
                } else {
                    this._trDuration += duration;
                    result = await this.next(this._trDuration);
                }
            } while (false);
        } catch (error) { }

        return result;
    }

    abstract async period(periodId: string): Promise<any>;

    abstract async next(duration: number): Promise<UpdateResult>;
}

class PeriodStart extends PeriodStatus implements Period {
    protected _name: string = "PeriodStart";

    async period(periodId: string): Promise<any> {
        return await this._dapp.startPeriod(SecretRandomer.getSecret(), periodId);
    }

    async next(duration: number): Promise<UpdateResult> {
        void duration;
        if (!timeline.isStartSlot(this._id)) {
            return new PeriodMothball(this._id);
        }

        return undefined;
    }
}

class PeriodMothball extends PeriodStatus implements Period {
    protected _name: string = "PeriodMothball";

    async period(periodId: string): Promise<any> {
        return await this._dapp.mothballPeriod(SecretRandomer.getSecret(), periodId);
    }

    async next(duration: number): Promise<UpdateResult> {
        void duration;
        if (!timeline.isMothballSlot(this._id)) {
            return new PeriodEnd(this._id);
        }

        return undefined;
    }
}

class PeriodEnd extends PeriodStatus implements Period {
    protected _name: string = "PeriodEnd";

    private _timeOfTower: TimeOfTower = new TimeOfTower();

    async period(periodId: string): Promise<any> {
        const endInfo = await this._timeOfTower.getPoints();
        return await this._dapp.endPeriod(SecretRandomer.getSecret(), periodId, endInfo.points, endInfo.hash);
    }

    async next(duration: number): Promise<UpdateResult> {
        void duration
        if (!timeline.isEndSlot(this._id)) {
            return new PeriodIdle();
        }

        return undefined;
    }
}

class PeriodIdle implements Period {
    private _dapp: ETMDapp;

    constructor() {
        this._dapp = new ETMDapp();
    }
    async update(duration: number): Promise<UpdateResult> {
        void duration;

        try {
            const period = await this._dapp.getCurrentPeriod();
            if (period === undefined || period.status === 2) {
                console.log("[PeriodIdle] checkNextPeriod");
                return await this._checkNextPeriod();
            }

            // console.log("period.status", period.status, period);
            if (period.status === 0) {
                return new PeriodStart(period.id, period.startTr!, true);
            } else if (period.status === 1) {
                return new PeriodMothball(period.id, period.mothballTr!, true);
            } else if (period.status === 2) {
                return new PeriodEnd(period.id, period.endTr!, true);
            }
        } catch (error) { }
        return undefined;
    }

    // /
    private async _checkNextPeriod(): Promise<UpdateResult> {
        const currentPeriodId = timeline.getCurrentPeriodId();
        if (currentPeriodId && timeline.isStartSlot(currentPeriodId)) {
            return new PeriodStart(currentPeriodId);
        }
        return undefined;
    }
}

class PeriodJob implements Job {
    private _id: string;
    private _periodInfo?: Period;

    constructor() {
        this._id = "schedId_period";
    }

    get Id() {
        return this._id;
    }

    async callback(duration: number): Promise<void> {
        if (this._periodInfo === undefined) {
            this._periodInfo = new PeriodIdle();
        }
        const changeNext = await this._periodInfo.update(duration);
        // console.log("PeriodJob callback called.", this._periodInfo, changeNext);
        if (changeNext) {
            this._periodInfo = changeNext;
        }
    }
}

export default PeriodJob;