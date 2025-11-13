import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(startDate ? startDate.split('T')[1] || "19:00" : "19:00");
  const [endTime, setEndTime] = useState(endDate ? endDate.split('T')[1] || "21:00" : "21:00");

  const parseDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    return new Date(dateStr);
  };

  const dateRange: DateRange = {
    from: parseDate(startDate),
    to: parseDate(endDate),
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const fromDate = format(range.from, "yyyy-MM-dd");
      onStartDateChange(`${fromDate}T${startTime}`);
    }
    if (range?.to) {
      const toDate = format(range.to, "yyyy-MM-dd");
      onEndDateChange(`${toDate}T${endTime}`);
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (startDate) {
      const date = format(parseDate(startDate)!, "yyyy-MM-dd");
      onStartDateChange(`${date}T${time}`);
    }
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    if (endDate) {
      const date = format(parseDate(endDate)!, "yyyy-MM-dd");
      onEndDateChange(`${date}T${time}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-decigo-deep-teal font-medium">Date & Time Range</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal rounded-xl border-decigo-slate-300",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM dd, yyyy")} {startTime} - {format(dateRange.to, "MMM dd, yyyy")} {endTime}
                </>
              ) : (
                format(dateRange.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Pick start and end dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              initialFocus
              className="pointer-events-auto"
            />
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-sm">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
