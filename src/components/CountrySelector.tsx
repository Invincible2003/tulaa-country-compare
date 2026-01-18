import { useState } from "react";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
  CommandList,
} from "@/components/ui/command";
import { Country } from "@/hooks/useCountries";

interface CountrySelectorProps {
  label: string;
  countries: Country[];
  selectedCountry: Country | null;
  onSelect: (country: Country | null) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const CountrySelector = ({
  label,
  countries,
  selectedCountry,
  onSelect,
  isLoading,
  isError,
  onRetry,
}: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);

  if (isError && countries.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="flex h-14 items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load</span>
          </div>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-14 w-full justify-between rounded-xl border-border bg-card px-4 text-left font-normal hover:bg-accent/50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ) : selectedCountry ? (
              <div className="flex items-center gap-3">
                <img
                  src={selectedCountry.flagSvg ?? selectedCountry.flagPng ?? ""}
                  alt={selectedCountry.nameCommon}
                  className="h-8 w-12 rounded object-cover shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{selectedCountry.nameCommon}</span>
                  <span className="text-xs text-muted-foreground">{selectedCountry.cca3}</span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a country...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 bg-popover border border-border shadow-xl z-50" align="start">
          <Command>
            <CommandInput placeholder="Search by name or code..." />
            <CommandList>
              <CommandEmpty>No countries found.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.cca3}
                    value={`${country.nameCommon} ${country.cca3}`}
                    onSelect={() => {
                      onSelect(country);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <img
                      src={country.flagSvg ?? country.flagPng ?? ""}
                      alt={country.nameCommon}
                      className="h-6 w-9 rounded object-cover shadow-sm"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{country.nameCommon}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{country.cca3}</span>
                    </div>
                    {selectedCountry?.cca3 === country.cca3 && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
