import { IFacade } from "pure-framework";
import EntanmoProxy from "../../../proxy/entanmo";
import TimeOfTowerProxy from "../../../proxy/timeoftower";

abstract class AbstractState {
    protected facade: IFacade;
    constructor(facade: IFacade) {
        this.facade = facade;
    }

    abstract get Name(): string;
    abstract async tick(elapsed: number): Promise<AbstractState | undefined>;

    protected get Entanmo(): EntanmoProxy {
        return this.facade.retrieveProxy(EntanmoProxy.TagName) as EntanmoProxy
    }

    protected get TimeOfTower(): TimeOfTowerProxy {
        return this.facade.retrieveProxy(TimeOfTowerProxy.TagName) as TimeOfTowerProxy;
    }

    protected get LogTime(): string {
        const now = new Date();
        const y = String(now.getFullYear()).padStart(4, "0");
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        const h = String(now.getHours()).padStart(2, "0");
        const M = String(now.getMinutes()).padStart(2, "0");
        const s = String(now.getSeconds()).padStart(2, "0");
        return `${y}-${m}-${d} ${h}:${M}:${s}`;
    }
}

export default AbstractState;