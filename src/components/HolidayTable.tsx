import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Holiday, HolidayType } from "@/types/calendar";
import { cn } from "@/lib/utils";

const typeBadge: Record<HolidayType, string> = {
  "Federal Holiday": "bg-holiday-federal text-primary-foreground hover:bg-holiday-federal/80",
  "Holiday Break": "bg-holiday-break text-primary-foreground hover:bg-holiday-break/80",
  "University Closure": "bg-holiday-closure text-accent-foreground hover:bg-holiday-closure/80",
  Other: "bg-holiday-other text-primary-foreground hover:bg-holiday-other/80",
};

type SortKey = "date" | "name" | "type";

const HolidayTable = ({ holidays }: { holidays: Holiday[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(true);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setAsc(!asc);
    else { setSortKey(key); setAsc(true); }
  };

  const sorted = [...holidays].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "date") cmp = a.startDate.localeCompare(b.startDate);
    else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else cmp = a.type.localeCompare(b.type);
    return asc ? cmp : -cmp;
  });

  const formatRange = (start: string, end: string) => {
    const s = parseISO(start);
    const e = parseISO(end);
    if (start === end) return format(s, "MMM d, yyyy");
    return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
  };

  const SortBtn = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => toggle(k)} className="gap-1 -ml-2">
      {children} <ArrowUpDown className="h-3 w-3" />
    </Button>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortBtn k="date">Date(s)</SortBtn></TableHead>
          <TableHead><SortBtn k="name">Name</SortBtn></TableHead>
          <TableHead className="hidden sm:table-cell">Description</TableHead>
          <TableHead><SortBtn k="type">Type</SortBtn></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((h, i) => (
          <TableRow key={i}>
            <TableCell className="whitespace-nowrap">{formatRange(h.startDate, h.endDate)}</TableCell>
            <TableCell className="font-medium">{h.name}</TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">{h.description}</TableCell>
            <TableCell>
              <Badge className={cn("text-xs", typeBadge[h.type])}>{h.type}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default HolidayTable;
