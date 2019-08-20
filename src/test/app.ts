
import program = require("commander");

import app, { Launcher } from "./launcher";

import Scheduler from "./scheduler";
import PeriodJob from "./period-job";

function main() {
    program.version("1.0.0")
        .option("-d, --dappid <dappid>", "config dappid")
        .option("-P, --protocol <protocol>", "config entanmo node protocol")
        .option("-h, --host <host>", "config entanmo node host")
        .option("-p, --port <port>", "config entanmo node port")
        .option("--tothost <tothost>", "config timeoftower host")
        .option("--totport <totport>", "config timeoftower port")
        .parse(process.argv);

    const launcher = app as Launcher;
    launcher.DappId = program.dappid;
    launcher.NodeProtocol = program.protocol;
    launcher.NodeHost = program.host;
    launcher.NodePort = program.port ? Number(program.port) : program.port;

    launcher.TimeOfTowerHost = program.tothost;
    launcher.TimeOfTowerPort = program.totport ? Number(program.totport) : program.totport;

    const scheduler = new Scheduler();
    const periodJob = new PeriodJob();
    scheduler.registerJob(periodJob);
    scheduler.run()
        .catch(error => console.log.bind(console));

    process.on("uncaughtException", (...args) => { console.log("app uncaughtException:", ...args) });
    process.on("unhandledRejection", (...args) => { console.log("app unhandledRejection:", ...args) });
    process.on("rejectionHandled", (...args) => { console.log("app rejectionHandled:", ...args) });
}

main();
