export type TimeOfTowerPointDef = {
    hash: string;
    points: string[]
}

export type DappPeriod = {
    id: string;
    status: number;
    startTr?: string;
    mothballTr?: string;
    endTr?: string;
}

export type DappRequestBody = {
    secret: string;
    fee: string;
    type: number;
    args: string;
}

export type NBSchedTickBody = {
    elapsed: number;
}