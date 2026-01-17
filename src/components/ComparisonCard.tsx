import { Country } from "@/hooks/useCountries";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Users, 
  Ruler, 
  Coins, 
  Languages, 
  Clock, 
  ExternalLink,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComparisonCardProps {
  country: Country;
  isPopulationWinner?: boolean;
  isAreaWinner?: boolean;
  index: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K";
  }
  return num.toString();
};

const formatArea = (area: number): string => {
  return area.toLocaleString() + " km²";
};

export const ComparisonCard = ({
  country,
  isPopulationWinner,
  isAreaWinner,
  index,
}: ComparisonCardProps) => {
  const currencies = country.currencies
    ? Object.values(country.currencies)
        .map((c) => `${c.name} (${c.symbol})`)
        .join(", ")
    : "N/A";

  const languages = country.languages
    ? Object.values(country.languages).slice(0, 3).join(", ")
    : "N/A";

  const timezones = country.timezones.slice(0, 2).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-md transition-all duration-300 hover:shadow-lg"
    >
      {/* Header with Flag */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={country.flags.svg}
          alt={country.flags.alt || country.name.common}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-foreground drop-shadow-sm">
            {country.name.common}
          </h3>
          <p className="text-sm text-muted-foreground">{country.name.official}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Capital & Region */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Capital
            </div>
            <p className="font-medium text-sm">{country.capital?.[0] || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Region
            </div>
            <p className="font-medium text-sm">
              {country.region}
              {country.subregion && (
                <span className="text-muted-foreground"> / {country.subregion}</span>
              )}
            </p>
          </div>
        </div>

        {/* Population & Area */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Population
              {isPopulationWinner && (
                <Badge variant="winner" className="ml-1">
                  <Trophy className="mr-1 h-3 w-3" />
                  Winner
                </Badge>
              )}
            </div>
            <p className={`font-semibold text-lg ${isPopulationWinner ? "text-winner" : ""}`}>
              {formatNumber(country.population)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              Area
              {isAreaWinner && (
                <Badge variant="winner" className="ml-1">
                  <Trophy className="mr-1 h-3 w-3" />
                  Winner
                </Badge>
              )}
            </div>
            <p className={`font-semibold text-lg ${isAreaWinner ? "text-winner" : ""}`}>
              {formatArea(country.area)}
            </p>
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            Currency
          </div>
          <p className="font-medium text-sm">{currencies}</p>
        </div>

        {/* Languages */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Languages className="h-3.5 w-3.5" />
            Languages
          </div>
          <p className="font-medium text-sm">{languages}</p>
        </div>

        {/* Timezones */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Timezones
          </div>
          <p className="font-medium text-sm">{timezones}</p>
        </div>

        {/* Map Button */}
        <Button
          variant="secondary"
          className="w-full"
          asChild
        >
          <a
            href={country.maps.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            View on Maps
          </a>
        </Button>
      </div>
    </motion.div>
  );
};
