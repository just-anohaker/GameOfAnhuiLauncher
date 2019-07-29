
import launcher from "../launcher";
import http from "./";

type Period = {
    id: string;
    status: number;
    startTr?: string;
    mothballTr?: string;
    endTr?: string;
}

class ETMDapp {
    constructor() {

    }

    private getUrl(path: string): string {
        const host = launcher.getDappServer();
        return host + path;
    }

    private getTransactionUnsignedUrl(): string {
        return this.getUrl("/transactions/unsigned");
    }

    async startPeriod(secret: string, periodId: string): Promise<any> {
        const body = {
            secret,
            fee: "0",
            type: 1100,
            args: JSON.stringify([periodId])
        };

        return await http.put(this.getTransactionUnsignedUrl(), body);
    }

    async mothballPeriod(secret: string, periodId: string): Promise<any> {
        const body = {
            secret,
            fee: "0",
            type: 1101,
            args: JSON.stringify([periodId])
        };

        return await http.put(this.getTransactionUnsignedUrl(), body);
    }

    async endPeriod(secret: string, periodId: string, points: string[], hash: string): Promise<any> {
        const body = {
            secret,
            fee: "0",
            type: 1102,
            args: JSON.stringify([periodId, points, hash])
        };

        return await http.put(this.getTransactionUnsignedUrl(), body);
    }

    async getCurrentPeriod(): Promise<Period | undefined> {
        try {
            const respPeriod = await http.get(launcher.getDappServer() + "/game/period");
            // console.log("[getCurrentPeriod]:", JSON.stringify(respPeriod));
            if (respPeriod.result) {
                const result = respPeriod.result;
                const resp: Period = { id: result.id, status: result.status };
                if (result.status === 0) {
                    resp.startTr = result.startTr;
                } else if (result.status === 1) {
                    resp.startTr = result.startTr;
                    resp.mothballTr = result.mothballTr;
                } else if (result.status === 2) {
                    resp.startTr = result.startTr;
                    resp.mothballTr = result.mothballTr;
                    resp.endTr = result.endTr;
                }
                return resp;
            }
        } catch (error) {
            throw error;
        }
        return undefined
    }

    async isTransactionBlocked(trId: string): Promise<boolean> {
        const host = launcher.getDappServer();
        const url = host + `/transactions/${trId}`;
        try {
            await http.get(url);
        } catch (error) {
            return false;
        }
        // console.log("[isTransactionBlocked]:", trId, JSON.stringify(resp));
        return true;
    }

    async isTransactionUnconfirmed(trId: string): Promise<boolean> {
        const host = launcher.getDappServer();
        const url = host + `/transactions/unconfirmed`;
        try {
            const resp = await http.get(url);
            // console.log("[isTransactionUnconfirmed]:", trId, JSON.stringify(resp));
            let transactions: any[] = resp.transactions;
            return transactions.some(tr => tr.id === trId);
        } catch (error) {
            console.log("[isTransactionUnconfirmed] exception:" + error);
            throw error;
        }
    }
}

export default ETMDapp;