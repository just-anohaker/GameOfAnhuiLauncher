
import launcher from "../launcher";
import http from "./";

class TimeOfTower {
    constructor() {

    }

    private getRandomUrl(): string {
        return launcher.getTimeOfTowerServer() + "/random";
    }

    private getLotteryUrl(): string {
        return launcher.getTimeOfTowerServer() + "/lottery";
    }

    async getPoints(): Promise<{ hash: string, points: string[] }> {
        const newRandom = await http.get(this.getRandomUrl(), { reverse: 1, limit: 1 });
        const hash = newRandom.randoms[0];

        const newLottery = await http.post(this.getLotteryUrl(), {
            data: [{
                arr: ["1", "2", "3", "4", "5", "6"],
                size: 3,
                type: 0
            }],
            hash
        });
        const points = newLottery.lottery[0];

        return { hash, points };
    }
}

export default TimeOfTower;