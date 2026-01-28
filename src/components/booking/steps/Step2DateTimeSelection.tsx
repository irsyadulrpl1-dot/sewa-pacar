import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { CompanionInfo } from "../BookingWizard";

interface Step2DateTimeSelectionProps {
  companion: CompanionInfo;
  selectedDate: string | null;
  selectedTime: string | null;
  duration: number | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onDurationChange: (duration: number) => void;
}

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export function Step2DateTimeSelection({
  companion,
  selectedDate,
  selectedTime,
  duration,
  onDateChange,
  onTimeChange,
  onDurationChange,
}: Step2DateTimeSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(() => {
    if (selectedDate) {
      try {
        const parsed = new Date(selectedDate);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    }
    return undefined;
  });

  // Sync duration with parent
  useEffect(() => {
    if (duration && duration > 0) {
      console.log("Duration synced:", duration);
    }
  }, [duration]);

  const handleDateSelect = (selected: Date | undefined) => {
    if (selected) {
      setDate(selected);
      // Format as YYYY-MM-DD
      try {
        const formatted = format(selected, "yyyy-MM-dd");
        onDateChange(formatted);
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Pilih Tanggal & Jam</h2>
        <p className="text-muted-foreground">
          Tentukan kapan Anda ingin bertemu dengan {companion.name}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Pilih Tanggal</h3>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              locale={id}
              className="rounded-md border"
            />
            {selectedDate && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">Tanggal dipilih:</p>
                <p className="font-semibold text-foreground">
                  {(() => {
                    try {
                      const date = new Date(selectedDate);
                      if (!isNaN(date.getTime())) {
                        return format(date, "EEEE, d MMMM yyyy", { locale: id });
                      }
                    } catch (e) {
                      console.error("Error formatting date:", e);
                    }
                    return selectedDate;
                  })()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Time & Duration Selection */}
        <div className="space-y-6">
          {/* Time Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Pilih Jam Mulai</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => onTimeChange(time)}
                      className={isSelected ? "bg-primary" : ""}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
              {selectedTime && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mt-4">
                  <p className="text-sm text-muted-foreground">Jam dipilih:</p>
                  <p className="font-semibold text-foreground">{selectedTime} WIB</p>
                </div>
              )}
            </div>
          </Card>

          {/* Duration Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="duration" className="text-base font-semibold">
                Durasi Pertemuan
              </Label>
              
              {/* Button-based selection as primary */}
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((hours) => {
                  const isSelected = duration === hours;
                  return (
                    <Button
                      key={hours}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        console.log("Duration button clicked:", hours);
                        onDurationChange(hours);
                      }}
                      className={isSelected ? "bg-primary text-primary-foreground" : ""}
                    >
                      {hours} {hours === 1 ? "jam" : "jam"}
                    </Button>
                  );
                })}
              </div>

              {/* Alternative: Dropdown Select */}
              <div className="pt-2">
                <Select
                  value={duration && duration > 0 ? duration.toString() : ""}
                  onValueChange={(value) => {
                    try {
                      const parsedDuration = parseInt(value, 10);
                      console.log("Select value changed:", value, "parsed:", parsedDuration);
                      if (!isNaN(parsedDuration) && parsedDuration > 0 && parsedDuration <= 8) {
                        console.log("Calling onDurationChange with:", parsedDuration);
                        onDurationChange(parsedDuration);
                      } else {
                        console.error("Invalid duration value:", value, "parsed:", parsedDuration);
                      }
                    } catch (error) {
                      console.error("Error in onValueChange:", error);
                    }
                  }}
                >
                  <SelectTrigger id="duration" className="w-full h-11">
                    <SelectValue placeholder="Atau pilih dari dropdown" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((hours) => (
                      <SelectItem key={hours} value={hours.toString()}>
                        {hours} {hours === 1 ? "jam" : "jam"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {duration && duration > 0 ? (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">Durasi dipilih:</p>
                  <p className="font-semibold text-foreground">{duration} {duration === 1 ? "jam" : "jam"}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Silakan pilih durasi pertemuan</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Validation Warning */}
      {(!selectedDate || !selectedTime || !duration) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Lengkapi semua informasi
            </p>
            <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              {!selectedDate && <li>Pilih tanggal pertemuan</li>}
              {!selectedTime && <li>Pilih jam mulai</li>}
              {!duration && <li>Pilih durasi pertemuan</li>}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}

