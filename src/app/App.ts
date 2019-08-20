import program = require("commander");

import AppFacade from "./facade/AppFacade";
import appconfig from "./base/config";

function main() {
    program.version("1.0.0")
        .option("-d, --dappid <dappid>", "config dappid")
        .option("-P, --protocol <protocol>", "config entanmo node protocol")
        .option("-h, --host <host>", "config entanmo node host")
        .option("-p, --port <port>", "config entanmo node port")
        .option("--tothost <tothost>", "config timeoftower host")
        .option("--totport <totport>", "config timeoftower port")
        .parse(process.argv);
    let dappid = appconfig.Dapp.Id;
    let dappProtocol = appconfig.Dapp.protocol;
    let dappHostname = appconfig.Dapp.hostname;
    let dappPort = appconfig.Dapp.port;
    let timeoftowerHostname = appconfig.TimeOfTower.hostname;
    let tiemoftowerPort = appconfig.TimeOfTower.port;
    if (program.dappid && (program.dappid as string).trim() !== "") {
        dappid = (program.dappid as string).trim();
    }
    if (program.protocol && (program.protocol as string).trim() !== "") {
        const protocol = (program.protocol as string).trim().toLocaleLowerCase();
        if (protocol === "http" || protocol === "https") {
            dappProtocol = protocol;
        }
    }
    if (program.host && (program.host as string).trim() !== "") {
        dappHostname = (program.host as string).trim();
    }
    if (program.port && (program.port as string).trim() !== "") {
        const port: number = Number(program.port);
        if (Number.isSafeInteger(port) && port > 1024) {
            dappPort = port;
        }
    }
    if (program.tothost && (program.tothost as string).trim() !== "") {
        timeoftowerHostname = (program.tothost as string).trim();
    }
    if (program.totoport && (program.tothost as string).trim() !== "") {
        const port: number = Number(program.totport);
        if (Number.isSafeInteger(port) && port > 1024) {
            tiemoftowerPort = port;
        }
    }
    appconfig.Dapp.Id = dappid;
    appconfig.Dapp.protocol = dappProtocol;
    appconfig.Dapp.hostname = dappHostname;
    appconfig.Dapp.port = dappPort;
    appconfig.TimeOfTower.hostname = timeoftowerHostname;
    appconfig.TimeOfTower.port = tiemoftowerPort;

    AppFacade.getInstance().appReady();

    process.on("uncaughtException", (...args) => { console.log("app uncaughtException:", ...args) });
    process.on("unhandledRejection", (...args) => { console.log("app unhandledRejection:", ...args) });
    process.on("rejectionHandled", (...args) => { console.log("app rejectionHandled:", ...args) });
}

main();