import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(value ? value.split('T')[1] || "19:00" : "19:00");

  const parseDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    return new Date(dateStr);
  };

  const selectedDate = parseDate(value);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      onChange(`${formattedDate}T${time}`);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (value) {
      const date = format(parseDate(value)!, "yyyy-MM-dd");
      onChange(`${date}T${newTime}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-decigo-deep-teal font-medium">Date & Time</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal rounded-xl border-decigo-slate-300",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              <>
                {format(selectedDate, "MMM dd, yyyy")} at {time}
              </>
            ) : (
              <span>Pick a date and time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
            <div className="border-t pt-4">
              <Label htmlFor="time" className="text-sm">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="rounded-lg mt-2"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
