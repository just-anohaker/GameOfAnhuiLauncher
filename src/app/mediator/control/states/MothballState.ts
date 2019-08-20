import { IFacade } from "pure-framework";
import BaseState from "./BaseState";
import Period from "../period";
import AbstractState from "./AbstractState";
import EndState from "./EndState";

class MothballState extends BaseState {
    constructor(facade: IFacade, period: Period, tr: string = "", trBlocked: boolean = false) {
        super(facade, period, tr, trBlocked);

        console.log(`[app ${this.LogTime}] ctor(MonthballState) [${period.toString()}, ${tr ? tr : "--"}, ${trBlocked}]`);
    }

    async doJob(period: Period): Promise<any> {
        return await this.Entanmo.mothballPeriod(period.Id);
    }

    async next(elapsed: number): Promise<AbstractState | undefined> {
        if (!this.period.inMonthball()) {
            return new EndState(this.facade, this.period);
        }

        return undefined;
    }
}

export default MothballState;