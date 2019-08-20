
// import "./app";

import app from "./launcher";
import etm_http from "./etm-http";
import tot_http from "./timeoftower-http";

import TimeOfTower from "./timeoftower-http/timeoftower";

import timeline from "./timeline";

if (require.main === module) {
    console.log(app.getDappServer());
    console.log(app.getNodeServer());
    console.log(app.getTimeOfTowerServer());

    // tot_http.get(app.getTimeOfTowerServer() + "/random", { reverse: 1, limit: 1 })
    //     .then(result => {
    //         console.log("random finished:", result);
    //     })
    //     .catch(error => {
    //         console.log("error:", error);
    //     });

    // tot_http.get(app.getTimeOfTowerServer() + "/random/getInfo", { hash: "1575259dc21b5f41e26547cc2112b1c7d71ec786cf086ede887376908eb40d3df5" })
    //     .then(result => console.log("getinfo finished"))
    //     .catch(error => console.log("error:", error));

    // tot_http.get(app.getTimeOfTowerServer() + "/random/getInfo", { index: 2070467 })
    //     .then(result => console.log("getinfo finished"))
    //     .catch(error => console.log("error:", error));

    // tot_http.post(app.getTimeOfTowerServer() + "/lottery", {
    //     data: [{
    //         arr: ["1", "2", "3", "4", "5", "6"],
    //         size: 3,
    //         type: 0
    //     }],
    //     hash: "1575259dc21b5f41e26547cc2112b1c7d71ec786cf086ede887376908eb40d3df5"
    // })
    //     .then(result => console.log("lottery finished:", JSON.stringify(result)))
    //     .catch(error => console.log("error:", error));

    // tot_http.get(app.getTimeOfTowerServer() + "/random", { reverse: 1, limit: 1 })
    //     .then(result => {
    //         console.log("getRandom result:", result);
    //         return tot_http.get(app.getTimeOfTowerServer() + "/random/getInfo", { hash: result.randoms[0] });
    //     })
    //     .then(result => {
    //         console.log("getInfo result:", JSON.stringify(result));
    //         return tot_http.post(app.getTimeOfTowerServer() + "/lottery", {
    //             data: [{
    //                 arr: ["1", "2", "3", "4", "5", "6"],
    //                 size: 3,
    //                 type: 0
    //             }],
    //             hash: result.information.random
    //         });
    //     })
    //     .then(result => {
    //         console.log("get points result:", JSON.stringify(result));
    //     })
    //     .catch(error => console.log.bind(console))

    // (new TimeOfTower()).getPoints()
    //     .then(result => {
    //         console.log("getNewPoints:", result);
    //     })
    //     .catch(error => console.log.bind(console));


    // etm_http.get(app.getDappServer() + "/account/game_balance",
    //     { address: "ABdJeu3dejMAo7bxXh6fiak3A4LSAcE1hT" })
    //     .then(result => {
    //         console.log("get finished:", result);
    //     })
    //     .catch(error => {
    //         console.log("error:", error);
    //     });

    const splitResult = timeline.splitPeriodId("2017090801");
    console.log(JSON.stringify(splitResult, null, 2));

    const currentPeriodId = timeline.getCurrentPeriodId();
    console.log(timeline.getCurrentPeriodId());
    console.log(timeline.getStartSlot(timeline.getCurrentPeriodId()!));
    console.log(timeline.getNextPeriodId(timeline.getCurrentPeriodId()!));
    console.log(timeline.isStartSlot(currentPeriodId!));
    console.log(timeline.isMothballSlot(currentPeriodId!));
    console.log(timeline.isEndSlot(currentPeriodId!));
}