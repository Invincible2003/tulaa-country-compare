import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Share2, Sparkles, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CountrySelector } from "@/components/CountrySelector";
import { ComparisonCard } from "@/components/ComparisonCard";
import { ComparisonSummary } from "@/components/ComparisonSummary";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { useCountries, Country } from "@/hooks/useCountries";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { data: countries = [], isLoading, isError, refetch } = useCountries();
  const [countryA, setCountryA] = useState<Country | null>(null);
  const [countryB, setCountryB] = useState<Country | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleCompare = useCallback(() => {
    if (!countryA || !countryB) {
      toast({
        title: "Selection Required",
        description: "Please select two countries to compare.",
        variant: "destructive",
      });
      return;
    }
    setShowComparison(true);
  }, [countryA, countryB]);

  const handleSwap = useCallback(() => {
    setCountryA(countryB);
    setCountryB(countryA);
  }, [countryA, countryB]);

  const handleReset = useCallback(() => {
    setCountryA(null);
    setCountryB(null);
    setShowComparison(false);
  }, []);

  const handleShare = useCallback(async () => {
    if (!countryA || !countryB) {
      toast({
        title: "Nothing to share",
        description: "Compare two countries first to share.",
        variant: "destructive",
      });
      return;
    }
    
    const shareText = `🌍 Compare ${countryA.name.common} vs ${countryB.name.common} on Tulaa!\n\nPopulation: ${countryA.population.toLocaleString()} vs ${countryB.population.toLocaleString()}\nArea: ${countryA.area.toLocaleString()} km² vs ${countryB.area.toLocaleString()} km²`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tulaa - Country Comparison",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Comparison details copied successfully.",
      });
    }
  }, [countryA, countryB]);

  const populationWinner = countryA && countryB
    ? (countryA.population > countryB.population ? "A" : "B")
    : null;
  const areaWinner = countryA && countryB
    ? (countryA.area > countryB.area ? "A" : "B")
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background bg-gradient-hero">
      <Navbar />
      
      <main className="container flex-1 px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Explore 250+ countries
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Compare Countries <span className="text-gradient-primary">Smartly</span>
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Discover fascinating insights by comparing population, area, languages, and more between any two countries.
          </p>
        </motion.div>

        {/* Error State */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                Failed to load countries
              </h3>
              <p className="text-sm text-muted-foreground">
                Please check your connection and try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </motion.div>
        )}

        {/* Country Selectors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 grid gap-6 md:grid-cols-2"
        >
          <CountrySelector
            label="Country A"
            countries={countries}
            selectedCountry={countryA}
            onSelect={setCountryA}
            isLoading={isLoading}
          />
          <CountrySelector
            label="Country B"
            countries={countries}
            selectedCountry={countryB}
            onSelect={setCountryB}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleCompare}
            disabled={!countryA || !countryB}
          >
            <Sparkles className="h-4 w-4" />
            Compare
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={handleSwap}
            disabled={!countryA && !countryB}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleReset}
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
            disabled={!showComparison}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </motion.div>

        {/* Comparison Results */}
        <AnimatePresence mode="wait">
          {showComparison && countryA && countryB && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Comparison Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                <ComparisonCard
                  country={countryA}
                  isPopulationWinner={populationWinner === "A"}
                  isAreaWinner={areaWinner === "A"}
                  index={0}
                />
                <ComparisonCard
                  country={countryB}
                  isPopulationWinner={populationWinner === "B"}
                  isAreaWinner={areaWinner === "B"}
                  index={1}
                />
              </div>

              {/* Summary Strip */}
              <ComparisonSummary countryA={countryA} countryB={countryB} />
            </motion.div>
          )}

          {/* Empty State Prompt */}
          {!showComparison && !isLoading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-4 rounded-full bg-secondary p-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Ready to Compare
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Select two countries above and click "Compare" to see detailed insights and statistics.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
