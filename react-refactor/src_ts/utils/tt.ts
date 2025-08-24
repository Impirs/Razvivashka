// transform date to time
export function toTime(d: any) : number {
    const t = new Date(d as any).getTime();
    return Number.isFinite(t) ? t : 0;
};