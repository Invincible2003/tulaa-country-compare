import { Country } from "@/hooks/useCountries";
import { motion } from "framer-motion";
import { Trophy, Users, Ruler } from "lucide-react";

interface ComparisonSummaryProps {
  countryA: Country;
  countryB: Country;
}

export const ComparisonSummary = ({ countryA, countryB }: ComparisonSummaryProps) => {
  const populationWinner = (countryA.population ?? 0) > (countryB.population ?? 0) ? countryA : countryB;
  const areaWinner = (countryA.area ?? 0) > (countryB.area ?? 0) ? countryA : countryB;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-md"
    >
      <h3 className="mb-4 text-center text-lg font-semibold text-foreground">Comparison Summary</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Population Winner</p>
            <div className="flex items-center gap-2">
              <img src={populationWinner.flagSvg ?? populationWinner.flagPng ?? ""} alt={populationWinner.nameCommon} className="h-5 w-7 rounded object-cover" />
              <span className="font-semibold text-foreground">{populationWinner.nameCommon}</span>
              <Trophy className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Ruler className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Area Winner</p>
            <div className="flex items-center gap-2">
              <img src={areaWinner.flagSvg ?? areaWinner.flagPng ?? ""} alt={areaWinner.nameCommon} className="h-5 w-7 rounded object-cover" />
              <span className="font-semibold text-foreground">{areaWinner.nameCommon}</span>
              <Trophy className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
