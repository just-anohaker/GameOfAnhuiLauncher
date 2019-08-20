import { Proxy, IProxy, IFacade } from "pure-framework";
import axios = require("axios");

import { TimeOfTowerPointDef } from "../../base/common/definitions";
import appconfig from "../../base/config";

const LOTTERY_DATA = [{ arr: ["1", "2", "3", "4", "5", "6"], size: 3, type: 0 }];

class TimeOfTowerProxy extends Proxy implements IProxy {
    static TagName: string = "TimeOfTowerProxy";

    constructor(facade: IFacade) {
        super(TimeOfTowerProxy.TagName, facade);
    }

    async getPoints(): Promise<TimeOfTowerPointDef> {
        const newRandom = await this.get(this.RandomURI, { reverse: 1, limit: 1 });
        const hash = newRandom.randoms[0];

        const newLottery = await this.post(this.LotteryURI, {
            data: LOTTERY_DATA,
            hash
        });
        const points = newLottery.lottery[0];
        return { hash, points };
    }

    private get RandomURI(): string {
        return this.Server + "/random";
    }

    private get LotteryURI(): string {
        return this.Server + "/lottery";
    }

    private get Server(): string {
        const timeoftower = appconfig.TimeOfTower;
        return `${timeoftower.protocol}://${timeoftower.hostname}:${timeoftower.port}`;
    }

    private async get(url: string, params: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data } = await axios.default.get(url, { params, timeout });
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.data;
        } catch (error) {
            console.log(`[app] timeoftowerproxy get[${url}, ${JSON.stringify(params)}] error:`, error.toString());
            throw error;
        }
    }

    private async post(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data } = await axios.default.post(url, body, { timeout });
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.data;
        } catch (error) {
            console.log(`[app] timeoftowerproxy post[${url}, ${JSON.stringify(body)}] error:`, error.toString());
            throw error;
        }
    }
}

export default TimeOfTowerProxy;