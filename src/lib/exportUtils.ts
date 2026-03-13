import { format, parseISO, addDays } from "date-fns";
import type { Holiday } from "@/types/calendar";

function pad(n: number) { return String(n).padStart(2, "0"); }

function toICSDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export function generateICS(holidays: Holiday[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AcademicCalendarAnalyzer//EN",
    "CALSCALE:GREGORIAN",
  ];

  holidays.forEach((h) => {
    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${toICSDate(h.startDate)}`,
      `DTEND;VALUE=DATE:${toICSDate(addDays(parseISO(h.endDate), 1).toISOString().split("T")[0])}`,
      `SUMMARY:${h.name}`,
      `DESCRIPTION:${h.description} (${h.type})`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function generateCSV(holidays: Holiday[]): string {
  const header = "Start Date,End Date,Name,Description,Type";
  const rows = holidays.map(
    (h) => `"${h.startDate}","${h.endDate}","${h.name.replace(/"/g, '""')}","${h.description.replace(/"/g, '""')}","${h.type}"`
  );
  return [header, ...rows].join("\n");
}

export function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
