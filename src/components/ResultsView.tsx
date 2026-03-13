import { format, parseISO } from "date-fns";
import { CalendarDays, Download, FileSpreadsheet, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HolidayCalendarGrid from "./HolidayCalendarGrid";
import HolidayTable from "./HolidayTable";
import { generateICS, generateCSV, download } from "@/lib/exportUtils";
import type { CalendarAnalysis, HolidayType } from "@/types/calendar";

const typeColors: Record<HolidayType, string> = {
  "Federal Holiday": "bg-holiday-federal",
  "Holiday Break": "bg-holiday-break",
  "University Closure": "bg-holiday-closure",
  Other: "bg-holiday-other",
};

const ResultsView = ({
  data,
  onReset,
}: {
  data: CalendarAnalysis;
  onReset: () => void;
}) => {
  const typeCounts = data.holidays.reduce<Record<string, number>>((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      {/* Summary Header */}
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold font-serif text-foreground sm:text-4xl">
          {data.semesterName}
        </h1>
        <p className="text-muted-foreground">
          {format(parseISO(data.startDate), "MMMM d, yyyy")} –{" "}
          {format(parseISO(data.endDate), "MMMM d, yyyy")}
        </p>
      </header>

      {/* Quick Stats */}
      <div className="flex flex-wrap justify-center gap-3">
        <Card className="min-w-[140px] text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-3xl font-bold text-primary">{data.totalHolidays}</p>
            <p className="text-xs text-muted-foreground">Total Days Off</p>
          </CardContent>
        </Card>
        {Object.entries(typeCounts).map(([type, count]) => (
          <Card key={type} className="min-w-[140px] text-center">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-full ${typeColors[type as HolidayType]}`} />
                <p className="text-xl font-bold">{count}</p>
              </div>
              <p className="text-xs text-muted-foreground">{type}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {Object.entries(typeColors).map(([type, cls]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-sm ${cls}`} />
            {type}
          </span>
        ))}
      </div>

      {/* Visual Calendar */}
      <section>
        <h2 className="mb-4 text-2xl font-serif font-semibold text-foreground">Calendar View</h2>
        <HolidayCalendarGrid
          holidays={data.holidays}
          startDate={data.startDate}
          endDate={data.endDate}
        />
      </section>

      {/* Holiday Table */}
      <section>
        <h2 className="mb-4 text-2xl font-serif font-semibold text-foreground">All Holidays & Breaks</h2>
        <Card>
          <CardContent className="p-0 sm:p-2">
            <HolidayTable holidays={data.holidays} />
          </CardContent>
        </Card>
      </section>

      {/* Export & Reset */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Button
          onClick={() => {
            const ics = generateICS(data.holidays);
            download(ics, "academic-calendar.ics", "text/calendar");
          }}
        >
          <CalendarDays className="mr-2 h-4 w-4" /> Download .ics
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const csv = generateCSV(data.holidays);
            download(csv, "academic-calendar.csv", "text/csv");
          }}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Download .csv
        </Button>
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Analyze Another
        </Button>
      </div>
    </div>
  );
};

export default ResultsView;
