import { Facade, IFacade } from "pure-framework";
import appevents from "../base/events";

// proxies
import TimeOfTowerProxy from "../proxy/timeoftower";
import EntanmoProxy from "../proxy/entanmo";
import SchedulerProxy from "../proxy/scheduler";
// mediators
import ControlMediator from "../mediator/control";

class AppFacade extends Facade implements IFacade {
    private static instance?: AppFacade;

    static getInstance(): AppFacade {
        if (AppFacade.instance === undefined) {
            AppFacade.instance = new AppFacade();

            AppFacade.instance.initProxy();
            AppFacade.instance.initMediator();
        }

        return AppFacade.instance;
    }

    private constructor() {
        super();
    }

    private initProxy(): void {
        this.registerProxy(new TimeOfTowerProxy(this));
        this.registerProxy(new EntanmoProxy(this));
        this.registerProxy(new SchedulerProxy(this));
    }

    private initMediator(): void {
        this.registerMediator(new ControlMediator(this));
    }

    appReady(): void {
        this.sendNotification(appevents.EvtAppReady);
    }
}

export default AppFacade;