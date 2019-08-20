import AbstractState from "./AbstractState";
import { IFacade } from "pure-framework";
import Period from "../period";
import IdleState from "./IdleState";

const TR_BLOCKED_DURATION = 5000;

abstract class BaseState extends AbstractState {
    protected elapsed: number;
    protected blockedElapsed: number;
    constructor(facade: IFacade, protected period: Period, protected tr: string = "", protected trBlocked: boolean = false) {
        super(facade);
        this.elapsed = 0;
        this.blockedElapsed = 0;
    }

    abstract async doJob(period: Period): Promise<any>;
    abstract async next(elapsed: number): Promise<AbstractState | undefined>;

    protected reset(tr: string = "", trBlocked: boolean = false, elapsed: number = 0, blockedElapsed: number = 0): void {
        this.tr = tr;
        this.trBlocked = trBlocked;
        this.elapsed = elapsed;
        this.blockedElapsed = blockedElapsed;
    }

    async tick(elapsed: number): Promise<AbstractState | undefined> {
        let result: AbstractState | undefined = undefined;
        try {
            do {
                if (this.tr === "") {
                    const job = await this.doJob(this.period);
                    this.reset(job.transactionId);
                    console.log(`[app ${this.LogTime}] commit tr[${this.period.toString()}, ${job.transactionId}]`);
                    break;
                }

                if (!this.trBlocked) {
                    if (this.blockedElapsed < TR_BLOCKED_DURATION) {
                        this.blockedElapsed += elapsed;
                        break;
                    }

                    this.blockedElapsed = elapsed;
                    const blocked = await this.Entanmo.isTransactionBlocked(this.tr);
                    console.log(`[app ${this.LogTime}] blocked tr[${this.tr}, ${blocked}]`);
                    if (!blocked) {
                        const unconfirmed = await this.Entanmo.isTransactionUnconfirmed(this.tr);
                        console.log(`[app ${this.LogTime}] unconfirmed tr[${this.tr}, ${unconfirmed}]`);
                        result = unconfirmed ? undefined : new IdleState(this.facade);
                        break;
                    }
                    this.reset(this.tr, true, 0);
                    break;
                }

                this.elapsed += elapsed;
                result = await this.next(this.elapsed);
            } while (false);
        } catch (error) {
            result = new IdleState(this.facade);
        }

        return result;
    }
}

export default BaseState;