import { IFacade } from "pure-framework";
import BaseState from "./BaseState";
import Period from "../period";
import AbstractState from "./AbstractState";
import IdleState from "./IdleState";

class EndState extends BaseState {
    constructor(facade: IFacade, period: Period, tr: string = "", trBlocked: boolean = false) {
        super(facade, period, tr, trBlocked);

        console.log(`[app ${this.LogTime}] ctor(${this.Name}) [${period.toString()}, ${tr ? tr : "--"}, ${trBlocked}]`);
    }

    /// @overwrite
    get Name(): string {
        return "EndState";
    }

    /// @overwrite
    async doJob(period: Period): Promise<any> {
        const end = await this.TimeOfTower.getPoints();
        return await this.Entanmo.endPeriod(period.Id, end.points, end.hash);
    }

    /// @overwrite
    async next(elapsed: number): Promise<AbstractState | undefined> {
        if (!this.period.inEnd()) {
            return new IdleState(this.facade);
        }

        return undefined;
    }
}

export default EndState;