import { Proxy, IProxy, IFacade } from "pure-framework";
import axios = require("axios");

import appconfig from "../../base/config";
import { DappRequestBody, DappPeriod } from "../../base/common/definitions";
import config from "../../base/config";

class EntanmoProxy extends Proxy implements IProxy {
    static TagName: string = "EntanmoProxy";

    constructor(facade: IFacade) {
        super(EntanmoProxy.TagName, facade);
    }

    async startPeriod(periodId: string): Promise<any> {
        // const body = {
        //     secret,
        //     fee: "0",
        //     type: 1100,
        //     args: JSON.stringify([periodId])
        // };

        return await this.put(
            this.UnsignedTransactionURI,
            this.buildRequestBody(this.Secret, [periodId], 1100)
        );
    }

    async mothballPeriod(periodId: string): Promise<any> {
        // const body = {
        //     secret,
        //     fee: "0",
        //     type: 1101,
        //     args: JSON.stringify([periodId])
        // };

        return await this.put(
            this.UnsignedTransactionURI,
            this.buildRequestBody(this.Secret, [periodId], 1101)
        );
    }

    async endPeriod(periodId: string, points: string[], hash: string): Promise<any> {
        // const body = {
        //     secret,
        //     fee: "0",
        //     type: 1102,
        //     args: JSON.stringify([periodId, points, hash])
        // };

        return await this.put(
            this.UnsignedTransactionURI,
            this.buildRequestBody(this.Secret, [periodId, points, hash], 1102)
        );
    }

    async getCurrentPeriod(): Promise<DappPeriod | undefined> {
        try {
            const respPeriod = await this.get(this.DappServer + "/game/period");
            // console.log("[app] getCurrentPeriod:", JSON.stringify(respPeriod));
            if (respPeriod.result) {
                const result = respPeriod.result;
                const resp: DappPeriod = { id: result.id, status: result.status };
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
        const host = this.DappServer;
        const url = host + `/transactions/${trId}`;
        try {
            await this.get(url);
        } catch (error) {
            return false;
        }
        // console.log("[app] isTransactionBlocked:", trId, JSON.stringify(resp));
        return true;
    }

    async isTransactionUnconfirmed(trId: string): Promise<boolean> {
        const host = this.DappServer;
        const url = host + `/transactions/unconfirmed`;
        try {
            const resp = await this.get(url);
            // console.log("[app] isTransactionUnconfirmed:", trId, JSON.stringify(resp));
            let transactions: any[] = resp.transactions;
            return transactions.some(tr => tr.id === trId);
        } catch (error) {
            console.log("[app] isTransactionUnconfirmed exception:" + error);
            throw error;
        }
    }

    private get Secret(): string {
        const secrets = config.DappSecrets;
        const idx = Math.floor(Math.random() * secrets.length);
        return secrets[idx];
    }

    private get DappServer(): string {
        const entanmo = appconfig.Dapp;
        return this.Server + `/api/dapps/${entanmo.Id}`;
    }

    private get Server(): string {
        const entanmo = appconfig.Dapp;
        return `${entanmo.protocol}://${entanmo.hostname}:${entanmo.port}`;
    }

    private get UnsignedTransactionURI(): string {
        return this.DappServer + "/transactions/unsigned";
    }

    private buildRequestBody(secret: string, args: any, type: number, fee: string = "0"): DappRequestBody {
        return {
            secret,
            fee,
            type,
            args: JSON.stringify(args)
        };
    }

    private async get(url: string, params: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data = { success: false, error: "" } } = await axios.default.get(url, { params, timeout });
            const { success } = data;
            delete data.success;
            if (!success) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.log(`[app] entanmoproxy get[${url}, ${JSON.stringify(params)}] error:`, error.toString());
            throw error;
        }

    }

    private async put(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data = { success: false, error: "" } } = await axios.default.put(url, body, { timeout });
            const { success } = data;
            delete data.success;
            if (!success) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.log(`[app] entanmoproxy put[${url}, ${JSON.stringify(body)}] error:`, error.toString());
            throw error;
        }
    }
}

export default EntanmoProxy;