import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      style={{
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
      className={cn(className)}
      styles={{
        caption: { display: "flex", justifyContent: "space-between" },
        months: {
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        },
        month: { display: "flex", flexDirection: "column", gap: "1rem" },
        caption_label: { fontSize: "1rem", fontWeight: "500" },
        nav: { display: "flex", gap: "0.5rem", alignItems: "center" },
        nav_button: {
          height: "1.75rem",
          width: "1.75rem",
          backgroundColor: "transparent",
          padding: 0,
          opacity: 0.5,
          "&:hover": { opacity: 1 },
        },
        nav_button_previous: { position: "absolute", left: "0.25rem" },
        nav_button_next: { position: "absolute", right: "0.25rem" },
        table: { width: "100%", borderCollapse: "collapse", gap: "0.25rem" },
        head_row: { display: "flex" },
        head_cell: {
          fontSize: "0.875rem",
          fontWeight: "normal",
          textAlign: "center",
          width: "2.25rem",
        },
        row: { display: "flex", marginTop: "0.5rem" },
        cell: {
          height: "2.25rem",
          width: "2.25rem",
          textAlign: "center",
          padding: 0,
          position: "relative",
          "&:has([aria-selected].day-range-end)": {
            borderRadius: "0 0.5rem 0.5rem 0",
          },
          "&:has([aria-selected].day-outside)": {
            backgroundColor: "var(--accent)",
          },
          "&:has([aria-selected])": { backgroundColor: "var(--accent)" },
          "&:first-child": { borderRadius: "0.5rem 0 0 0" },
          "&:last-child": { borderRadius: "0 0.5rem 0 0" },
        },
        day: {
          height: "2.25rem",
          width: "2.25rem",
          padding: 0,
          fontWeight: "normal",
          "&[aria-selected]": { opacity: 1 },
        },
        day_range_end: { borderRadius: "0 0.5rem 0.5rem 0" },
        day_selected: {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          "&:hover": {
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          },
        },
        day_today: {
          backgroundColor: "var(--accent)",
          color: "var(--accent-foreground)",
        },
        day_outside: {
          color: "var(--muted-foreground)",
          "&[aria-selected]": {
            backgroundColor: "var(--accent)",
            color: "var(--muted-foreground)",
          },
        },
        day_disabled: { color: "var(--muted-foreground)", opacity: 0.5 },
        day_range_middle: {
          backgroundColor: "var(--accent)",
          color: "var(--accent-foreground)",
        },
        day_hidden: { visibility: "hidden" },
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
