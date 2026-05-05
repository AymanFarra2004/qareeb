"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/app/[locale]/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/app/[locale]/components/ui/popover";
import { ScrollArea } from "@/src/app/[locale]/components/ui/scroll-area";
import { useTranslations } from "next-intl";

export interface TimePickerProps {
  value?: string; // Format "HH:mm" (24h)
  onChange?: (value: string) => void;
  initialValue?: string;
  defaultPeriod?: "AM" | "PM";
  minuteStep?: number;
  name?: string;
  label?: string;
  placeholder?: string;
  error?: boolean;
}

export function TimePicker({
  value,
  onChange,
  initialValue,
  defaultPeriod = "AM",
  minuteStep = 1,
  name,
  label,
  placeholder,
  error = false,
}: TimePickerProps) {
  const t = useTranslations("TimePicker");
  const [internalValue, setInternalValue] = React.useState<string>(
    value || initialValue || ""
  );
  
  // Parse initial state
  const parseValue = (val: string) => {
    if (!val) return { hour: null, minute: "00", period: defaultPeriod };
    const [hStr, mStr] = val.split(":");
    let hour = parseInt(hStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return {
      hour: hour.toString(),
      minute: mStr || "00",
      period,
    };
  };

  const current = parseValue(value || internalValue);
  const [selectedHour, setSelectedHour] = React.useState<string | null>(current.hour);
  const [selectedMinute, setSelectedMinute] = React.useState<string>(current.minute);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>(current.period);

  React.useEffect(() => {
    if (value) {
      const parsed = parseValue(value);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
    }
  }, [value]);

  const updateValue = (h: string | null, m: string, p: string) => {
    if (!h) return;
    
    let hour24 = parseInt(h, 10);
    if (p === "PM" && hour24 < 12) hour24 += 12;
    if (p === "AM" && hour24 === 12) hour24 = 0;
    
    const newValue = `${hour24.toString().padStart(2, "0")}:${m.padStart(2, "0")}`;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => 
    (i * minuteStep).toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  const displayValue = selectedHour 
    ? `${selectedHour.padStart(2, '0')}:${selectedMinute} ${selectedPeriod}`
    : placeholder || t("selectTime");

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input type="hidden" name={name} value={value || internalValue} />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 px-3 py-2 rounded-xl border-input bg-background/50 backdrop-blur-sm transition-all hover:bg-accent/10 focus:ring-2 focus:ring-primary/20",
              !selectedHour && "text-muted-foreground",
              error && "border-destructive ring-1 ring-destructive/20"
            )}
          >
            <Clock className="mr-2 h-4 w-4 opacity-70" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 rounded-2xl overflow-hidden border-border bg-background/95 backdrop-blur-md shadow-2xl" align="start">
          <div className="flex h-[280px] divide-x divide-border rtl:divide-x-reverse">
            {/* Hours */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 pb-1 border-b border-border/50">
                   {t("hours")}
                </div>
                {hours.map((h) => (
                  <Button
                    key={h}
                    variant={selectedHour === h ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "justify-center h-9 mb-0.5 rounded-lg text-sm font-medium",
                      selectedHour === h ? "shadow-md shadow-primary/20 scale-105" : "hover:bg-primary/5 hover:text-primary"
                    )}
                    onClick={() => {
                      setSelectedHour(h);
                      updateValue(h, selectedMinute, selectedPeriod);
                    }}
                  >
                    {h.padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Minutes */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-2">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 pb-1 border-b border-border/50">
                   {t("minutes")}
                </div>
                {minutes.map((m) => (
                  <Button
                    key={m}
                    variant={selectedMinute === m ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "justify-center h-9 mb-0.5 rounded-lg text-sm font-medium",
                      selectedMinute === m ? "shadow-md shadow-primary/20 scale-105" : "hover:bg-primary/5 hover:text-primary"
                    )}
                    onClick={() => {
                      setSelectedMinute(m);
                      updateValue(selectedHour, m, selectedPeriod);
                    }}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Period */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-2">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 pb-1 border-b border-border/50">
                   {t("period")}
                </div>
                {periods.map((p) => (
                  <Button
                    key={p}
                    variant={selectedPeriod === p ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "justify-center h-9 mb-0.5 rounded-lg text-xs font-bold uppercase",
                      selectedPeriod === p ? "shadow-md shadow-primary/20 scale-105" : "hover:bg-primary/5 hover:text-primary"
                    )}
                    onClick={() => {
                      setSelectedPeriod(p);
                      updateValue(selectedHour, selectedMinute, p);
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
