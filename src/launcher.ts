
import * as dappCfg from "./config/dapp";
import * as totCfg from "./config/timeOfTower";

export interface ILauncher {
    readonly DappId: string;
    readonly NodeProtocol: string;
    readonly NodeHost: string;
    readonly NodePort: number;

    readonly TimeOfTowerHost: string;
    readonly TimeOfTowerPort: number;

    getNodeServer(): string;
    getDappServer(): string;
    getTimeOfTowerServer(): string;
}

export class Launcher implements ILauncher {
    private _dappId: string;
    private _nodeProtocol: string;
    private _nodeServer: string;
    private _nodePort: number;

    private _totServer: string;
    private _totPort: number;

    constructor() {
        this._dappId = dappCfg.DappId;
        this._nodeProtocol = dappCfg.etmNodeServerProtocol;
        this._nodeServer = dappCfg.etmNodeServer;
        this._nodePort = dappCfg.etmNodePort;

        this._totServer = totCfg.timeOfTowerServer;
        this._totPort = totCfg.timeOfTowerPort;
    }

    get DappId() {
        return this._dappId;
    }

    get NodeProtocol() {
        return this._nodeProtocol;
    }

    get NodeHost() {
        return this._nodeServer;
    }

    get NodePort() {
        return this._nodePort
    }

    get TimeOfTowerHost() {
        return this._totServer;
    }

    get TimeOfTowerPort() {
        return this._totPort;
    }

    set DappId(val: string) {
        val = val === undefined ? "" : val.trim();
        if (val === "") {
            return;
        }

        this._dappId = val;
    }

    set NodeProtocol(val: string) {
        val = val === undefined ? "" : val.trim();
        if (val !== "http" && val !== "https") {
            return;
        }

        this._nodeProtocol = val;
    }

    set NodeHost(val: string) {
        val = val === undefined ? "" : val.trim();
        if (val === "") {
            return;
        }

        this._nodeServer = val;
    }

    set NodePort(val: number) {
        if (!Number.isSafeInteger(val) || val <= 1024) {
            return;
        }

        this._nodePort = val;
    }

    set TimeOfTowerHost(val: string) {
        val = val === undefined ? "" : val.trim();
        if (val === "") {
            return;
        }

        this._totServer = val;
    }

    set TimeOfTowerPort(val: number) {
        if (!Number.isSafeInteger(val) || val <= 1024) {
            return;
        }

        this._totPort = val;
    }

    getNodeServer(): string {
        return `${this._nodeProtocol}://${this._nodeServer}:${this._nodePort}`;
    }

    getDappServer(): string {
        return `${this.getNodeServer()}/api/dapps/${this._dappId}`;
    }

    getTimeOfTowerServer(): string {
        return `http://${this._totServer}:${this._totPort}`;
    }

}

const launcher = new Launcher();

export default launcher as ILauncher;