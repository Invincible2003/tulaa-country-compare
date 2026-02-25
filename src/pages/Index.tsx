import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Share2, Sparkles, Shuffle, WifiOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CountrySelector } from "@/components/CountrySelector";
import { Button } from "@/components/ui/button";
import { useCountries, Country } from "@/hooks/useCountries";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const navigate = useNavigate();
  const { data: countries = [], isLoading, isError, refetch, usingFallback } = useCountries();
  const [countryA, setCountryA] = useState<Country | null>(null);
  const [countryB, setCountryB] = useState<Country | null>(null);

  // Set default countries (India and USA) when data loads
  useEffect(() => {
    if (countries.length > 0 && !countryA && !countryB) {
      const india = countries.find((c) => c.cca3 === "IND");
      const usa = countries.find((c) => c.cca3 === "USA");
      if (india) setCountryA(india);
      if (usa) setCountryB(usa);
    }
  }, [countries, countryA, countryB]);

  // Random compare handler
  const handleRandomCompare = useCallback(() => {
    if (countries.length < 2) return;
    const shuffled = [...countries].sort(() => Math.random() - 0.5);
    setCountryA(shuffled[0]);
    setCountryB(shuffled[1]);
    navigate(`/compare?c1=${shuffled[0].cca3}&c2=${shuffled[1].cca3}`);
  }, [countries, navigate]);

  const handleCompare = useCallback(() => {
    if (!countryA || !countryB) {
      toast({
        title: "Selection Required",
        description: "Please select two countries to compare.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/compare?c1=${countryA.cca3}&c2=${countryB.cca3}`);
  }, [countryA, countryB, navigate]);

  const handleSwap = useCallback(() => {
    setCountryA(countryB);
    setCountryB(countryA);
  }, [countryA, countryB]);

  const handleReset = useCallback(() => {
    setCountryA(null);
    setCountryB(null);
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
    
    const shareUrl = `${window.location.origin}/compare?c1=${countryA.cca3}&c2=${countryB.cca3}`;
    const shareText = `🌍 Compare ${countryA.nameCommon} vs ${countryB.nameCommon} on Tulaa!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tulaa - Country Comparison",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied to clipboard!",
        description: "Share link copied successfully.",
      });
    }
  }, [countryA, countryB]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
            Tulaa – Compare Countries <span className="text-primary">Smartly</span>
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Discover fascinating insights by comparing population, area, economy, health indicators, and more between any two countries.
          </p>
        </motion.div>

        {/* Fallback Banner */}
        {usingFallback && (
          <Alert className="mb-6 border-yellow-500/30 bg-yellow-500/10">
            <WifiOff className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              Using offline country list (API unavailable). Some countries may be missing.
              <Button variant="link" size="sm" onClick={() => refetch()} className="ml-2 text-yellow-600 dark:text-yellow-400">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
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
            isError={isError}
            onRetry={() => refetch()}
          />
          <CountrySelector
            label="Country B"
            countries={countries}
            selectedCountry={countryB}
            onSelect={setCountryB}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
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
            variant="default"
            size="lg"
            onClick={handleCompare}
            disabled={!countryA || !countryB}
            className="bg-primary hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Compare Now
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleRandomCompare}
            disabled={countries.length < 2}
          >
            <Shuffle className="h-4 w-4" />
            Random Compare
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSwap}
            disabled={!countryA && !countryB}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
          <Button
            variant="ghost"
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
            disabled={!countryA || !countryB}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { title: "Economy", desc: "GDP, GDP per capita, and economic indicators", icon: "💰" },
            { title: "Population", desc: "Population size and density comparisons", icon: "👥" },
            { title: "Health", desc: "Life expectancy, birth and death rates", icon: "🏥" },
            { title: "Environment", desc: "CO2 emissions and environmental data", icon: "🌍" },
          ].map((feature, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <h3 className="mb-1 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-16 flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="mb-4 rounded-full bg-secondary p-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Ready to Compare
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Select two countries above and click "Compare Now" to see detailed insights and statistics.
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
