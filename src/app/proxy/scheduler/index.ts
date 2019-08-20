import { Proxy, IProxy, IFacade, IObserver, Observer, INotification } from "pure-framework";
import appevents from "../../base/events";
import { NBSchedTickBody } from "../../base/common/definitions";

const SCHED_INTERVAL = 100;

class SchedulerProxy extends Proxy implements IProxy {
    static TagName: string = "SchedulerProxy";

    private observer: IObserver;
    private schedHandler?: NodeJS.Timeout;
    constructor(facade: IFacade) {
        super(SchedulerProxy.TagName, facade);

        this.observer = new Observer(this.onNotification, this);
    }

    onRegister(): void {
        super.onRegister();

        this.facade.registerObserver(appevents.EvtAppReady, this.observer);
    }

    onRemove(): void {
        super.onRemove();

        this.stopSched();

        this.facade.removeObserver(appevents.EvtAppReady, this);
    }

    private onNotification(notification: INotification): void {
        const name = notification.getName();
        const body = notification.getBody();
        if (name === appevents.EvtAppReady) {
            this.startSched();
        }
    }

    private startSched(): void {
        const self = this;
        let uptime = Math.floor(process.uptime() * 1000);
        this.schedHandler = setTimeout(function _tick(): void {
            const enduptime = Math.floor(process.uptime() * 1000);
            self.schedHandler = undefined;
            const data: NBSchedTickBody = { elapsed: enduptime - uptime };
            self.sendNotification(appevents.EvtSchedTick, data);
            uptime = enduptime;
            self.schedHandler = setTimeout(_tick, SCHED_INTERVAL);
        }, SCHED_INTERVAL);
    }

    private stopSched(): void {
        if (this.schedHandler) {
            clearTimeout(this.schedHandler);
            this.schedHandler = undefined;
        }
    }
}

export default SchedulerProxy;