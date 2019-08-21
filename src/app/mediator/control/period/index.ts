const PERIOD_START_TIME = { hour: 8, minute: 40 };
const kPeriodInterval = 5;
const DURATION_PER_PERIOD = {
    minute: kPeriodInterval,
    second: kPeriodInterval * 60,
    millisecond: kPeriodInterval * 60 * 1000
};
const MAX_PERIODID_PER_DAY = 160;

export const PERIOD_DURATIONS = {
    start: Math.floor(3 * 60 * 1000),
    monthball: Math.floor(1.5 * 60 * 1000),
    end: Math.floor(0.5 * 60 * 1000)
};

class Period {
    static current(): Period | undefined {
        const now = new Date();
        const year = now.getFullYear(), month = now.getMonth() + 1, date = now.getDate();
        const st = new Date(year, month - 1, date, PERIOD_START_TIME.hour, PERIOD_START_TIME.minute);
        const diff = now.getTime() - st.getTime();
        if (diff < 0) {
            return undefined;
        }

        const periodId = Math.floor(diff / (60 * 1000) / DURATION_PER_PERIOD.minute) + 1;
        if (periodId > MAX_PERIODID_PER_DAY) {
            return undefined;
        }

        return new Period(year, month, date, periodId);
    }

    static parse(period: string): Period | undefined {
        period = period ? period.trim() : "";
        const execResult = /^(\d{4})(\d{2})(\d{2})(\d{3})$/g.exec(period);
        if (execResult == null) {
            return undefined;
        }

        const [_, year, month, date, periodId] = execResult;
        return new Period(
            Number(year),
            Number(month),
            Number(date),
            Number(periodId)
        );
    }

    constructor(private year: number, private month: number, private date: number, private periodId: number) { }

    inStart(): boolean {
        const now = Date.now();
        return now > this.StartTime && now < this.MonthballTime;
    }

    inMonthball(): boolean {
        const now = Date.now();
        return now >= this.MonthballTime && now < this.EndTime;
    }

    inEnd(): boolean {
        const now = Date.now();
        const nextPeriod = this.NextPeriod;
        if (nextPeriod === undefined) {
            // 今天开盘结束
            const current = Period.current();
            return current === undefined ? true : false;
        }
        return now >= this.EndTime && now < nextPeriod.StartTime;
    }

    get StartTime(): number {
        const s = new Date(this.year, this.month - 1, this.date, PERIOD_START_TIME.hour, PERIOD_START_TIME.minute);
        return s.getTime() + (this.periodId - 1) * DURATION_PER_PERIOD.millisecond;
    }

    get MonthballTime(): number {
        return this.StartTime + PERIOD_DURATIONS.start;
    }

    get EndTime(): number {
        return this.StartTime + PERIOD_DURATIONS.start + PERIOD_DURATIONS.monthball;
    }

    get NextPeriod(): Period | undefined {
        if (this.periodId + 1 > MAX_PERIODID_PER_DAY) {
            return undefined;
        }

        return new Period(this.year, this.month, this.date, this.periodId + 1);
    }

    get Id(): string {
        const y = this.year.toString().padStart(4, "0");
        const m = this.month.toString().padStart(2, "0");
        const d = this.date.toString().padStart(2, "0");
        const periodId = this.periodId.toString().padStart(3, "0");
        return `${y}${m}${d}${periodId}`;
    }

    toString(): string {
        const y = this.year.toString().padStart(4, "0");
        const m = this.month.toString().padStart(2, "0");
        const d = this.date.toString().padStart(2, "0");
        const periodId = this.periodId.toString().padStart(3, "0");
        return `${y}${m}${d}-${periodId}`;
    }
}

export default Period;