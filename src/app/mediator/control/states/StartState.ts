import { IFacade } from "pure-framework";
import BaseState from "./BaseState";
import Period from "../period";
import AbstractState from "./AbstractState";
import MothballPeriod from "./MothballState";

class StartState extends BaseState {
    constructor(facade: IFacade, period: Period, tr: string = "", trBlocked: boolean = false) {
        super(facade, period, tr, trBlocked);

        console.log(`[app ${this.LogTime}] ctor(StartState) [${period.toString()}, ${tr ? tr : "--"}, ${trBlocked}]`);
    }

    async doJob(period: Period): Promise<any> {
        return await this.Entanmo.startPeriod(period.Id);
    }

    async next(elapsed: number): Promise<AbstractState | undefined> {
        if (!this.period.inStart()) {
            return new MothballPeriod(this.facade, this.period);
        }

        return undefined;
    }
}

export default StartState;