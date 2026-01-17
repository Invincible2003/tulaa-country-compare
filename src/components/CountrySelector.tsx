import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Country } from "@/hooks/useCountries";
import { motion, AnimatePresence } from "framer-motion";

interface CountrySelectorProps {
  label: string;
  countries: Country[];
  selectedCountry: Country | null;
  onSelect: (country: Country | null) => void;
  isLoading?: boolean;
}

export const CountrySelector = ({
  label,
  countries,
  selectedCountry,
  onSelect,
  isLoading,
}: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const lowerSearch = search.toLowerCase();
    return countries.filter((country) =>
      country.name.common.toLowerCase().includes(lowerSearch)
    );
  }, [countries, search]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="glass"
            role="combobox"
            aria-expanded={open}
            className="h-14 w-full justify-between px-4 text-left font-normal"
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
                  src={selectedCountry.flags.svg}
                  alt={selectedCountry.flags.alt || selectedCountry.name.common}
                  className="h-8 w-12 rounded object-cover shadow-sm"
                />
                <span className="font-medium">{selectedCountry.name.common}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a country...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 bg-popover border border-border shadow-lg z-50" align="start">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent p-0 focus-visible:ring-0 h-auto"
            />
          </div>
          <ScrollArea className="h-[300px]">
            <AnimatePresence mode="popLayout">
              {filteredCountries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 text-center text-sm text-muted-foreground"
                >
                  No countries found.
                </motion.div>
              ) : (
                <div className="p-2">
                  {filteredCountries.map((country) => (
                    <motion.button
                      key={country.cca3}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      onClick={() => {
                        onSelect(country);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50",
                        selectedCountry?.cca3 === country.cca3 && "bg-accent"
                      )}
                    >
                      <img
                        src={country.flags.svg}
                        alt={country.flags.alt || country.name.common}
                        className="h-6 w-9 rounded object-cover shadow-sm"
                      />
                      <span className="flex-1 font-medium text-sm">
                        {country.name.common}
                      </span>
                      {selectedCountry?.cca3 === country.cca3 && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
