
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
    isStartSlot(periodId: string) {
        const startTime = this.getStartSlot(periodId);
        const mothballTime = this.getMothballSlot(periodId);
        // console.log(`[isStartSlot] periodId(${periodId}),startTime(${startTime}),mothballTime(${mothballTime})`);
        if (startTime == null || mothballTime == null) return false;

        const now = Date.now();
        // console.log(`[isStartSlot] now(${now})`);
        return (now >= startTime && now < mothballTime);
    }

    isMothballSlot(periodId: string) {
        const mothballTime = this.getMothballSlot(periodId);
        const endTime = this.getEndSlot(periodId);
        // console.log(`[isMothballSlot] periodId(${periodId}),mothballTime(${mothballTime}),endTime(${endTime})`);
        if (mothballTime == null || endTime == null) return false;

        const now = Date.now();
        // console.log(`[isMothballSlot] now(${now})`);
        return (now >= mothballTime && now < endTime);
    }

    isEndSlot(periodId: string) {
        const endTime = this.getEndSlot(periodId);
        const nextPeriodId = this.getNextPeriodId(periodId);
        // console.log(`[isEndSlot] periodId(${periodId}),endTime(${endTime}),nextPeriodId(${nextPeriodId})`);
        if (endTime == null) return false;

        const now = Date.now();
        // console.log(`[isEndSlot] now(${now})`);
        return nextPeriodId == null
            ? (now >= endTime)
            : (now >= endTime && now < this.getStartSlot(nextPeriodId)!);
    }

    getCurrentPeriodId() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();

        const startTime = new Date(year, month - 1, date, START_HOUR, START_MINUTE);
        const diff = now.getTime() - startTime.getTime();
        if (diff < 0) {
            return undefined;
        }

        const diffMinutes = Math.floor(diff / ONE_MINUTE);
        const diffTimes = Math.floor(diffMinutes / PERIOD_PER_DURATION_M) + 1; // 从0开始，所以每次要+1，要显示的值从1开始
        if (diffTimes > PERIOD_MAX_TIMES) return undefined;

        const yearStr = year.toString().padStart(4, "0");
        const monthStr = month.toString().padStart(2, "0");
        const dateStr = date.toString().padStart(2, "0");
        const timesStr = diffTimes.toString().padStart(3, "0");

        return yearStr + monthStr + dateStr + timesStr;
    }

    getOriginSlot() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();

        const startTime = new Date(year, month - 1, date, START_HOUR, START_MINUTE);
        return startTime.getTime();
    }

    getNextPeriodId(periodId: string) {
        const splitResult = this.splitPeriodId(periodId);
        if (splitResult == null) return null;

        let times = Number(splitResult.times);
        if (!Number.isSafeInteger(times) || times > PERIOD_MAX_TIMES) return null;
        times++;

        splitResult.times = times.toString().padStart(3, "0");
        return splitResult.year + splitResult.month + splitResult.day + splitResult.times;
    }

    getStartSlot(periodId: string) {
        const splitResult = this.splitPeriodId(periodId);
        if (splitResult == null) return null;

        let year = Number(splitResult.year);
        let month = Number(splitResult.month);
        let date = Number(splitResult.day);
        let times = Number(splitResult.times);
        if (!Number.isSafeInteger(year) ||
            !Number.isSafeInteger(month) ||
            !Number.isSafeInteger(date) ||
            !Number.isSafeInteger(times) ||
            times > PERIOD_MAX_TIMES) return null;

        const startTime = new Date(year, month - 1, date, START_HOUR, START_MINUTE);
        const resultTime = startTime.getTime() + (times - 1) * PERIOD_PER_DURATION_MS;
        return resultTime;
    }

    getMothballSlot(periodId: string) {
        const startTime = this.getStartSlot(periodId);
        if (startTime == null) return null;

        return startTime + START_DURATION;
    }

    getEndSlot(periodId: string) {
        const startTime = this.getStartSlot(periodId);
        if (startTime == null) return null;

        return startTime + START_DURATION + MOTHBALL_DURATION;
    }

    splitPeriodId(periodId: string) {
        periodId = periodId ? periodId.trim() : "";
        const result = /^(\d{4})(\d{2})(\d{2})(\d{3})$/g.exec(periodId);
        if (result == null) {
            return null;
        }
        const [_, year, month, day, times] = result;
        return { year, month, day, times };
    }
}

const timeline = new Timeline();
export default timeline;