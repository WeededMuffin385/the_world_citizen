export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function tripDays(start: Date, end: Date): number {
    const utcDay = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.round((utcDay(end) - utcDay(start)) / 86_400_000) + 1;
}

export function formatDate(date: Date | null): string {
    return date ? date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : 'Select date';
}

export function calendarDays(month: Date): (Date | null)[] {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({length: offset}, () => null);
    for (let day = 1; day <= count; day++) {
        cells.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    while (cells.length % 7) cells.push(null);
    return cells;
}
