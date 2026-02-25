import { Country } from "@/hooks/useCountries";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Users, 
  Ruler, 
  Coins, 
  Languages, 
  Clock,
  Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ComparisonCardProps {
  country: Country;
  isPopulationWinner?: boolean;
  isAreaWinner?: boolean;
  index: number;
}

const formatNumber = (num?: number): string => {
  if (!num) return "N/A";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
  return num.toString();
};

export const ComparisonCard = ({
  country,
  isPopulationWinner,
  isAreaWinner,
  index,
}: ComparisonCardProps) => {
  const currencies = country.currencies
    ? Object.values(country.currencies).map((c) => `${c.name} (${c.symbol ?? ""})`).join(", ")
    : "N/A";

  const languages = country.languages
    ? Object.values(country.languages).slice(0, 3).join(", ")
    : "N/A";

  const timezones = country.timezones?.slice(0, 2).join(", ") ?? "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-md"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={country.flagSvg ?? country.flagPng ?? ""}
          alt={country.nameCommon}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-foreground drop-shadow-sm">{country.nameCommon}</h3>
          <p className="text-sm text-muted-foreground">{country.cca3}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />Capital
            </div>
            <p className="font-medium text-sm">{country.capital ?? "N/A"}</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Region</div>
            <p className="font-medium text-sm">{country.region}{country.subregion && ` / ${country.subregion}`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />Population
              {isPopulationWinner && <Badge variant="secondary" className="ml-1 text-emerald-500"><Trophy className="mr-1 h-3 w-3" />Winner</Badge>}
            </div>
            <p className={`font-semibold text-lg ${isPopulationWinner ? "text-emerald-500" : ""}`}>{formatNumber(country.population)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />Area
              {isAreaWinner && <Badge variant="secondary" className="ml-1 text-emerald-500"><Trophy className="mr-1 h-3 w-3" />Winner</Badge>}
            </div>
            <p className={`font-semibold text-lg ${isAreaWinner ? "text-emerald-500" : ""}`}>{country.area?.toLocaleString() ?? "N/A"} km²</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Coins className="h-3.5 w-3.5" />Currency</div>
          <p className="font-medium text-sm">{currencies}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Languages className="h-3.5 w-3.5" />Languages</div>
          <p className="font-medium text-sm">{languages}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />Timezones</div>
          <p className="font-medium text-sm">{timezones}</p>
        </div>
      </div>
    </motion.div>
  );
};
