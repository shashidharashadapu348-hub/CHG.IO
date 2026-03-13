import { useMemo } from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth,
  getDay, addMonths, isWithinInterval, parseISO, startOfWeek, endOfWeek,
} from "date-fns";
import type { Holiday, HolidayType } from "@/types/calendar";
import { cn } from "@/lib/utils";

const typeColors: Record<HolidayType, string> = {
  "Federal Holiday": "bg-holiday-federal text-primary-foreground",
  "Holiday Break": "bg-holiday-break text-primary-foreground",
  "University Closure": "bg-holiday-closure text-accent-foreground",
  Other: "bg-holiday-other text-primary-foreground",
};

interface Props {
  holidays: Holiday[];
  startDate: string;
  endDate: string;
}

const HolidayCalendarGrid = ({ holidays, startDate, endDate }: Props) => {
  const months = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const result: Date[] = [];
    let cur = startOfMonth(start);
    while (cur <= endOfMonth(end)) {
      result.push(cur);
      cur = addMonths(cur, 1);
    }
    return result;
  }, [startDate, endDate]);

  const getHolidayForDay = (day: Date): Holiday | undefined => {
    return holidays.find((h) =>
      isWithinInterval(day, { start: parseISO(h.startDate), end: parseISO(h.endDate) })
    );
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calStart = startOfWeek(monthStart);
        const calEnd = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: calStart, end: calEnd });

        return (
          <div key={month.toISOString()} className="rounded-lg border bg-card p-3">
            <h4 className="mb-2 text-center text-sm font-semibold font-serif text-foreground">
              {format(month, "MMMM yyyy")}
            </h4>
            <div className="grid grid-cols-7 gap-px text-center text-xs">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="py-1 font-medium text-muted-foreground">{d}</div>
              ))}
              {days.map((day) => {
                const inMonth = isSameMonth(day, month);
                const holiday = inMonth ? getHolidayForDay(day) : undefined;
                return (
                  <div
                    key={day.toISOString()}
                    title={holiday?.name}
                    className={cn(
                      "flex h-7 w-full items-center justify-center rounded text-xs transition-colors",
                      !inMonth && "text-muted-foreground/30",
                      inMonth && !holiday && "text-foreground",
                      holiday && typeColors[holiday.type]
                    )}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HolidayCalendarGrid;
