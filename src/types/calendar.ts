export type HolidayType = "Federal Holiday" | "Holiday Break" | "University Closure" | "Other";

export interface Holiday {
  name: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  description: string;
  type: HolidayType;
}

export interface CalendarAnalysis {
  semesterName: string;
  startDate: string;
  endDate: string;
  totalHolidays: number;
  holidays: Holiday[];
}

export type InputMode = "pdf" | "image" | "text";

export type AppState = "upload" | "loading" | "results";
