import { Country } from "@/hooks/useCountries";
import { motion } from "framer-motion";
import { Trophy, Users, Ruler } from "lucide-react";

interface ComparisonSummaryProps {
  countryA: Country;
  countryB: Country;
}

export const ComparisonSummary = ({ countryA, countryB }: ComparisonSummaryProps) => {
  const populationWinner = countryA.population > countryB.population ? countryA : countryB;
  const areaWinner = countryA.area > countryB.area ? countryA : countryB;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border bg-gradient-card p-6 shadow-md"
    >
      <h3 className="mb-4 text-center text-lg font-semibold text-foreground">
        Comparison Summary
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Population Winner */}
        <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent shadow-md">
            <Users className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Population Winner</p>
            <div className="flex items-center gap-2">
              <img
                src={populationWinner.flags.svg}
                alt={populationWinner.name.common}
                className="h-5 w-7 rounded object-cover shadow-sm"
              />
              <span className="font-semibold text-foreground">
                {populationWinner.name.common}
              </span>
              <Trophy className="h-4 w-4 text-winner" />
            </div>
          </div>
        </div>

        {/* Area Winner */}
        <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent shadow-md">
            <Ruler className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Area Winner</p>
            <div className="flex items-center gap-2">
              <img
                src={areaWinner.flags.svg}
                alt={areaWinner.name.common}
                className="h-5 w-7 rounded object-cover shadow-sm"
              />
              <span className="font-semibold text-foreground">
                {areaWinner.name.common}
              </span>
              <Trophy className="h-4 w-4 text-winner" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
