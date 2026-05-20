"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { DayPicker } from "react-day-picker";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "react-day-picker/style.css";

const API_DATE = "yyyy-MM-dd";

function parseApiDate(value: string): Date | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  const d = parse(v, API_DATE, new Date());
  return isValid(d) ? d : undefined;
}

export interface ProfileDatePickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  disabled?: boolean;
}

/**
 * Date-only picker for profile forms. Uses Popover + DayPicker so it works
 * inside Radix Dialog (native date inputs often fail there).
 */
export function ProfileDatePickerField({
  id,
  label,
  value,
  onChange,
  disabled,
}: ProfileDatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseApiDate(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover modal={false} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-start px-3 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            <span className="truncate">
              {selected ? format(selected, "dd/MM/yyyy") : "Pick a date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, API_DATE));
              } else {
                onChange("");
              }
              setOpen(false);
            }}
            captionLayout="dropdown"
            fromYear={1950}
            toYear={new Date().getFullYear() + 30}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
