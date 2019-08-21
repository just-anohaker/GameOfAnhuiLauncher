import { IFacade } from "pure-framework";
import AbstractState from "./AbstractState";
import Period from "../period";
import StartState from "./StartState";
import MothballState from "./MothballState";
import EndState from "./EndState";

const MAX_ELAPSED = 2 * 1000;

class IdleState extends AbstractState {
    private duration: number;

    constructor(facade: IFacade) {
        super(facade);

        this.duration = 0;

        console.log(`[app ${this.LogTime}] ctor(${this.Name})`);
    }

    /// @overwrite
    get Name(): string {
        return "IdleState";
    }

    /// @overwrite
    async tick(elapsed: number): Promise<AbstractState | undefined> {
        try {
            const currentPeriod = await this.Entanmo.getCurrentPeriod();
            if (currentPeriod) {
                console.log(`[app ${this.LogTime}] tick(${this.Name}) id(${currentPeriod!.id}), status(${currentPeriod!.status})`);
            }
            if (currentPeriod === undefined /* || currentPeriod.status === 2 */) {
                this.duration += elapsed;
                if (this.duration >= MAX_ELAPSED) {
                    this.duration = 0;
                    return await this.nextState();
                }

                throw new Error("elapsed time is not enough");
            }

            this.duration = MAX_ELAPSED;
            if (currentPeriod.status === 0) {
                return new StartState(
                    this.facade,
                    Period.parse(currentPeriod.id)!,
                    currentPeriod.startTr!,
                    true
                );
            } else if (currentPeriod.status === 1) {
                return new MothballState(
                    this.facade,
                    Period.parse(currentPeriod.id)!,
                    currentPeriod.mothballTr!,
                    true
                );
            } else if (currentPeriod.status === 2) {
                const period = Period.parse(currentPeriod.id)!;
                if (period.inEnd()) {
                    return new EndState(
                        this.facade,
                        Period.parse(currentPeriod.id)!,
                        currentPeriod.endTr!,
                        true
                    );
                } else {
                    return await this.nextState();
                }
            }
        } catch (error) { }
        return undefined;
    }

    private async nextState(): Promise<AbstractState | undefined> {
        const current = Period.current();
        if (current && current.inStart()) {
            return new StartState(this.facade, current);
        }
        return undefined;
    }
}

export default IdleState;