import { Mediator, IMediator, IFacade, IObserver, Observer, INotification } from "pure-framework";
import appevents from "../../base/events";
import { NBSchedTickBody } from "../../base/common/definitions";

import AbstractState from "./states/AbstractState";
import IdleState from "./states/IdleState";

class ControlMediator extends Mediator implements IMediator {
    private static TagName: string = "ControlMediator";

    private observer: IObserver;
    private elapsed: number;
    private waitting: boolean;
    private currentState: AbstractState;
    constructor(facade: IFacade) {
        super(ControlMediator.TagName, facade);

        this.observer = new Observer(this.onNotification, this);
        this.elapsed = 0;
        this.waitting = false;
        this.currentState = new IdleState(this.facade);
    }

    onRegister(): void {
        super.onRegister();

        this.facade.registerObserver(appevents.EvtSchedTick, this.observer);
    }

    onRemove(): void {
        super.onRemove();

        this.facade.removeObserver(appevents.EvtSchedTick, this);
    }

    private onNotification(notification: INotification): void {
        const name = notification.getName();
        const body = notification.getBody();

        if (name === appevents.EvtSchedTick) {
            this.tick(body as NBSchedTickBody);
        }
    }

    private tick(body: NBSchedTickBody): void {
        this.elapsed += body.elapsed;
        if (this.waitting) {
            return;
        }

        const duration = this.elapsed;
        this.elapsed = 0;
        this.waitting = true;
        this.currentState.tick(duration)
            .then(result => {
                if (result !== undefined) {
                    this.currentState = result;
                }
                this.waitting = false;
            })
            .catch(error => {
                // TODO
                this.waitting = false;
            });
    }
}

export default ControlMediator;