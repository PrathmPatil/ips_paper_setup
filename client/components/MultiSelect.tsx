import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string | Option[];
}

interface MultiSelectProps {
  options?: Option[];
  value?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isChild?: boolean;
  isMultiple?: boolean;
}

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
  isChild = false,
  isMultiple = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedSet = useMemo(() => new Set(value || []), [value]);

  // ✅ Toggle a single string option
  const toggle = (val?: string) => {
    if (!val || typeof val !== "string") return;
    const next = new Set(selectedSet);
    next.has(val) ? next.delete(val) : next.add(val);
    onChange(Array.from(next));
  };

  // ✅ Clear all selected
  const clear = () => onChange([]);

  // ✅ Collect all nested string values
  const getAllValues = (opts: Option[]): string[] =>
    (opts || []).flatMap((opt) =>
      Array.isArray(opt.value)
        ? getAllValues(opt.value)
        : typeof opt.value === "string"
        ? [opt.value]
        : []
    );

  const allSelected =
    selectedSet.size === getAllValues(safeOptions).length &&
    safeOptions.length > 0;

  // ✅ Recursive render for nested options
  const renderOptions = (opts: Option[], level = 0) =>
    (opts || []).map((opt) => {
      if (Array.isArray(opt.value) && opt.value.length > 0) {
        const childValues = getAllValues(opt.value);
        const parentSelected = childValues.every((v) => selectedSet.has(v));

        const toggleParent = () => {
          const next = new Set(selectedSet);
          if (parentSelected) childValues.forEach((v) => next.delete(v));
          else childValues.forEach((v) => next.add(v));
          onChange(Array.from(next));
        };

        return (
          <div key={opt.label} className={`pl-${level * 4} mb-1`}>
            <div
              className="flex items-center font-semibold cursor-pointer mb-1"
              onClick={toggleParent}
            >
              <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                {parentSelected && <Check className="h-4 w-4" />}
              </div>
              {opt.label}
            </div>
            {renderOptions(opt.value, level + 1)}
          </div>
        );
      }

      if (typeof opt.value !== "string") return null;

      return (
        <CommandItem
          key={opt.value}
          onSelect={() => toggle(opt.value)}
          className="cursor-pointer"
        >
          <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
            {selectedSet.has(opt.value) && <Check className="h-4 w-4" />}
          </div>
          {opt.label}
        </CommandItem>
      );
    });

  // ✅ Resolve label by value recursively
  const getLabel = (val: string, opts: Option[]): string | null => {
    for (const opt of opts || []) {
      if (Array.isArray(opt.value)) {
        const found = getLabel(val, opt.value);
        if (found) return found;
      } else if (opt.value === val) return opt.label;
    }
    return val;
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate text-left text-muted-foreground">
              {value.length === 0
                ? placeholder
                : value.map((v) => getLabel(v, safeOptions)).join(", ")}
            </span>
            <ChevronDown className="opacity-60 ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[320px]" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No options available</CommandEmpty>
            <ScrollArea className="max-h-64 overflow-y-scroll">
              <CommandGroup>
                {/* ✅ Select All / Deselect All */}
                <CommandItem
                  onSelect={() =>
                    allSelected
                      ? clear()
                      : onChange(getAllValues(safeOptions))
                  }
                  disabled={safeOptions.length === 0}
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                    {allSelected && <Check className="h-4 w-4" />}
                  </div>
                  {allSelected ? "Deselect All" : "Select All"}
                </CommandItem>

                {/* ✅ Render options */}
                {isChild
                  ? renderOptions(safeOptions)
                  : safeOptions.map((opt) =>
                      typeof opt.value === "string" ? (
                        <CommandItem
                          key={opt.value}
                          onSelect={() => toggle(opt.value)}
                        >
                          <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                            {selectedSet.has(opt.value) && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                          {opt.label}
                        </CommandItem>
                      ) : null
                    )}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
