
import { Job } from "./scheduler";
import ETMDapp from "./etm-http/etm-dapp";
import timeline, { START_DURATION, MOTHBALL_DURATION, END_DURATION } from "./timeline";

type UpdateResult = Period | undefined;

interface Period {
    update(duration: number): Promise<UpdateResult>;
}

abstract class PeriodStatus implements Period {
    protected _dapp: ETMDapp;
    protected _id: string;
    protected _tr: string;
    protected _trBlocked: boolean;
    protected _trDuration: number;

    constructor(id: string, tr: string = "", trBlock: boolean = false) {
        this._dapp = new ETMDapp();
        this._id = id;
        this._tr = tr;
        this._trBlocked = trBlock;
        this._trDuration = 0;
    }

    protected reset(tr: string = "", blocked: boolean = false, duration: number = 0): void {
        this._tr = tr;
        this._trBlocked = blocked;
        this._trDuration = duration;
    }

    async update(duration: number): Promise<UpdateResult> {
        let result: UpdateResult = undefined;
        try {
            do {
                if (this._tr === "") {
                    // const startPeriod = await this._dapp.startPeriod("", this._id);
                    const startPeriod = await this.period(this._id);
                    this.reset(startPeriod.transactionId);
                } else if (!this._trBlocked) {
                    const isTrBlock = await this._dapp.isTransactionBlocked(this._tr);
                    if (!isTrBlock) {
                        const isTrUnconfirmed = await this._dapp.isTransactionUnconfirmed(this._tr);
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
        } catch (error) { /** TODO */ }

        return result;
    }

    abstract async period(periodId: string): Promise<any>;

    abstract async next(duration: number): Promise<UpdateResult>;
}

class PeriodStart extends PeriodStatus implements Period {
    async period(periodId: string): Promise<any> {
        // TODO
        return await this._dapp.startPeriod("", periodId);
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
    async period(periodId: string): Promise<any> {
        // TODO
        return await this._dapp.mothballPeriod("", periodId);
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
    async period(periodId: string): Promise<any> {
        // TODo
        return await this._dapp.endPeriod("", periodId, []);
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
            if (period === undefined) {
                return await this._checkNextPeriod();
            }

            if (period.status === 0) {
                return new PeriodStart(period.id, period.startTr!, true);
            } else if (period.status === 1) {
                return new PeriodMothball(period.id, period.mothballTr!, true);
            } else if (period.status === 2) {
                return new PeriodEnd(period.id, period.endTr!, true);
            }
        } catch (error) {
            // TODO
        }
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
        if (changeNext) {
            this._periodInfo = changeNext;
        }
    }
}

export default PeriodJob;