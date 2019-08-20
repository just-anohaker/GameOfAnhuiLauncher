
const START_HOUR = 8;
const START_MINUTE = 40;

const PERIOD_MAX_TIMES = 160;

const PERIOD_PER_DURATION_M = 5;
const PERIOD_PER_DURATION_S = PERIOD_PER_DURATION_M * 60;
const PERIOD_PER_DURATION_MS = PERIOD_PER_DURATION_S * 1000;

const ONE_MINUTE = 60 * 1000;

export const START_DURATION = 3 * 60 * 1000; // 17 * 60 * 1000;
export const MOTHBALL_DURATION = Math.floor(1.5 * 60 * 1000);
export const END_DURATION = Math.floor(0.5 * 60 * 1000);

export class Timeline {
    static isStartSlot(periodId: string) {
        const start = Timeline.getStartSlot(periodId);
        const mothball = Timeline.getMothballSlot(periodId);
        // console.log(`[isStartSlot] periodId(${periodId}),startTime(${startTime}),mothballTime(${mothballTime})`);
        if (start == null || mothball == null) return false;

        const now = Date.now();
        // console.log(`[isStartSlot] now(${now})`);
        return (now >= start && now < mothball);
    }

    static isMothballSlot(periodId: string) {
        const mothball = Timeline.getMothballSlot(periodId);
        const end = Timeline.getEndSlot(periodId);
        // console.log(`[isMothballSlot] periodId(${periodId}),mothballTime(${mothballTime}),endTime(${endTime})`);
        if (mothball == null || end == null) return false;

        const now = Date.now();
        // console.log(`[isMothballSlot] now(${now})`);
        return (now >= mothball && now < end);
    }

    static isEndSlot(periodId: string) {
        const end = Timeline.getEndSlot(periodId);
        const nextPeriodId = Timeline.getNextPeriodId(periodId);
        // console.log(`[isEndSlot] periodId(${periodId}),endTime(${endTime}),nextPeriodId(${nextPeriodId})`);
        if (end == null) return false;

        const now = Date.now();
        // console.log(`[isEndSlot] now(${now})`);
        return nextPeriodId == null
            ? (now >= end)
            : (now >= end && now < Timeline.getStartSlot(nextPeriodId)!);
    }

    static getCurrentPeriodId() {
        const now = new Date();
        const [year, month, date] = [now.getFullYear(), now.getMonth() + 1, now.getDate()];

        const start = new Date(year, month - 1, date, START_HOUR, START_MINUTE);
        const diff = now.getTime() - start.getTime();
        if (diff < 0) {
            return undefined;
        }

        const diffMinutes = Math.floor(diff / ONE_MINUTE);
        const diffTimes = Math.floor(diffMinutes / PERIOD_PER_DURATION_M) + 1; // 从0开始，所以每次要+1，要显示的值从1开始
        if (diffTimes > PERIOD_MAX_TIMES) return undefined;

        const result = [
            year.toString().padStart(4, "0"),
            month.toString().padStart(2, "0"),
            date.toString().padStart(2, "0"),
            diffTimes.toString().padStart(3, "0")
        ];

        return result.join("");
    }

    static getNextPeriodId(periodId: string) {
        const splitResult = Timeline.splitPeriodId(periodId);
        if (splitResult == null) return null;

        let times = Number(splitResult.times);
        if (!Number.isSafeInteger(times) || times > PERIOD_MAX_TIMES) return null;
        times++;

        splitResult.times = times.toString().padStart(3, "0");
        const result = [
            splitResult.year,
            splitResult.month,
            splitResult.day,
            splitResult.times
        ];
        return result.join("");
    }

    static getStartSlot(periodId: string) {
        const splitResult = Timeline.splitPeriodId(periodId);
        if (splitResult == null) return null;

        const [year, month, date, times] = [
            Number(splitResult.year),
            Number(splitResult.month),
            Number(splitResult.day),
            Number(splitResult.times)
        ];
        if (!Number.isSafeInteger(year) ||
            !Number.isSafeInteger(month) ||
            !Number.isSafeInteger(date) ||
            !Number.isSafeInteger(times) ||
            times > PERIOD_MAX_TIMES) return null;

        const start = new Date(year, month - 1, date, START_HOUR, START_MINUTE);
        return start.getTime() + (times - 1) * PERIOD_PER_DURATION_MS;
    }

    static getMothballSlot(periodId: string) {
        const start = Timeline.getStartSlot(periodId);
        if (start == null) return null;

        return start + START_DURATION;
    }

    static getEndSlot(periodId: string) {
        const start = Timeline.getStartSlot(periodId);
        if (start == null) return null;

        return start + START_DURATION + MOTHBALL_DURATION;
    }

    static splitPeriodId(periodId: string) {
        periodId = periodId ? periodId.trim() : "";
        const result = /^(\d{4})(\d{2})(\d{2})(\d{3})$/g.exec(periodId);
        if (result == null) {
            return null;
        }
        const [_, year, month, day, times] = result;
        return { year, month, day, times };
    }
}

export default Timeline;