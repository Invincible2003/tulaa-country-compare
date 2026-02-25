import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Share2, Download, Heart, HeartOff, Home, Trophy, WifiOff } from "lucide-react";
import { toPng } from "html-to-image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCountries, Country } from "@/hooks/useCountries";
import { useWorldBankData } from "@/hooks/useWorldBankData";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "@/hooks/use-toast";

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "N/A";
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const formatCurrency = (currencies?: Record<string, { name: string; symbol?: string }>): string => {
  if (!currencies) return "N/A";
  const entries = Object.entries(currencies);
  if (entries.length === 0) return "N/A";
  const [code, { name, symbol }] = entries[0];
  return `${name} (${symbol ?? code})`;
};

const formatLanguages = (languages?: Record<string, string>): string => {
  if (!languages) return "N/A";
  return Object.values(languages).slice(0, 3).join(", ") || "N/A";
};

const WinnerBadge = ({ winner }: { winner: "A" | "B" | "tie" }) => {
  if (winner === "tie") return <span className="text-muted-foreground text-xs">Tie</span>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      winner === "A" ? "bg-emerald-500/20 text-emerald-500" : "bg-blue-500/20 text-blue-500"
    }`}>
      <Trophy className="h-3 w-3" />
      {winner === "A" ? "Country A" : "Country B"}
    </span>
  );
};

const CompareRow = ({ 
  label, 
  valueA, 
  valueB, 
  higherIsBetter = true 
}: { 
  label: string; 
  valueA: string | number | undefined | null; 
  valueB: string | number | undefined | null;
  higherIsBetter?: boolean;
}) => {
  const numA = typeof valueA === "number" ? valueA : parseFloat(String(valueA)) || 0;
  const numB = typeof valueB === "number" ? valueB : parseFloat(String(valueB)) || 0;
  
  let winner: "A" | "B" | "tie" = "tie";
  if (numA !== numB && !isNaN(numA) && !isNaN(numB)) {
    if (higherIsBetter) {
      winner = numA > numB ? "A" : "B";
    } else {
      winner = numA < numB ? "A" : "B";
    }
  }

  const displayA = typeof valueA === "number" ? formatNumber(valueA) : (valueA ?? "N/A");
  const displayB = typeof valueB === "number" ? formatNumber(valueB) : (valueB ?? "N/A");

  return (
    <div className="grid grid-cols-4 gap-2 py-3 border-b border-border last:border-0">
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className={`text-center ${winner === "A" ? "text-emerald-500 font-semibold" : ""}`}>
        {displayA}
      </div>
      <div className={`text-center ${winner === "B" ? "text-blue-500 font-semibold" : ""}`}>
        {displayB}
      </div>
      <div className="text-right">
        <WinnerBadge winner={winner} />
      </div>
    </div>
  );
};

const Compare = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement>(null);
  
  const c1 = searchParams.get("c1") || "IND";
  const c2 = searchParams.get("c2") || "USA";
  
  const { data: countries = [], isLoading: countriesLoading, usingFallback, refetch } = useCountries();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  const [countryA, setCountryA] = useState<Country | null>(null);
  const [countryB, setCountryB] = useState<Country | null>(null);
  
  const favoriteKey = `${c1}-${c2}`;

  useEffect(() => {
    if (countries.length > 0) {
      const foundA = countries.find(c => c.cca3 === c1);
      const foundB = countries.find(c => c.cca3 === c2);
      setCountryA(foundA ?? null);
      setCountryB(foundB ?? null);
    }
  }, [countries, c1, c2]);

  const { data: wbDataA, isLoading: wbLoadingA } = useWorldBankData(c1);
  const { data: wbDataB, isLoading: wbLoadingB } = useWorldBankData(c2);

  const handleSwap = useCallback(() => {
    navigate(`/compare?c1=${c2}&c2=${c1}`);
  }, [c1, c2, navigate]);

  const handleReset = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/compare?c1=${c1}&c2=${c2}`;
    const shareText = `🌍 Compare ${countryA?.nameCommon ?? c1} vs ${countryB?.nameCommon ?? c2} on Tulaa!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tulaa - Country Comparison",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied to clipboard!",
        description: "Share link copied successfully.",
      });
    }
  }, [c1, c2, countryA, countryB]);

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    
    try {
      const dataUrl = await toPng(exportRef.current, {
        backgroundColor: "#0a0a0a",
        quality: 1,
      });
      
      const link = document.createElement("a");
      link.download = `tulaa-compare-${c1}-vs-${c2}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Exported!",
        description: "Comparison saved as PNG.",
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Could not export comparison.",
        variant: "destructive",
      });
    }
  }, [c1, c2]);

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(favoriteKey);
    toast({
      title: isFavorite(favoriteKey) ? "Removed from favorites" : "Added to favorites",
      description: `${countryA?.nameCommon ?? c1} vs ${countryB?.nameCommon ?? c2}`,
    });
  }, [favoriteKey, toggleFavorite, isFavorite, countryA, countryB, c1, c2]);

  const isLoading = countriesLoading || wbLoadingA || wbLoadingB;

  // Chart data
  const chartData = [
    {
      name: "Population",
      [countryA?.nameCommon ?? "A"]: countryA?.population ?? 0,
      [countryB?.nameCommon ?? "B"]: countryB?.population ?? 0,
    },
    {
      name: "Area (km²)",
      [countryA?.nameCommon ?? "A"]: countryA?.area ?? 0,
      [countryB?.nameCommon ?? "B"]: countryB?.area ?? 0,
    },
  ];

  const gdpChartData = [
    {
      name: "GDP ($)",
      [countryA?.nameCommon ?? "A"]: wbDataA?.gdp ?? 0,
      [countryB?.nameCommon ?? "B"]: wbDataB?.gdp ?? 0,
    },
    {
      name: "GDP per Capita ($)",
      [countryA?.nameCommon ?? "A"]: wbDataA?.gdpPerCapita ?? 0,
      [countryB?.nameCommon ?? "B"]: wbDataB?.gdpPerCapita ?? 0,
    },
  ];

  const healthChartData = [
    {
      name: "Life Expectancy",
      [countryA?.nameCommon ?? "A"]: wbDataA?.lifeExpectancy ?? 0,
      [countryB?.nameCommon ?? "B"]: wbDataB?.lifeExpectancy ?? 0,
    },
    {
      name: "Birth Rate",
      [countryA?.nameCommon ?? "A"]: wbDataA?.birthRate ?? 0,
      [countryB?.nameCommon ?? "B"]: wbDataB?.birthRate ?? 0,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="container flex-1 px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Compare</span>
        </div>

        {/* Fallback Banner */}
        {usingFallback && (
          <Alert className="mb-6 border-yellow-500/30 bg-yellow-500/10">
            <WifiOff className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              Using offline data. Some information may be limited.
              <Button variant="link" size="sm" onClick={() => refetch()} className="ml-2 text-yellow-600">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={handleSwap}>
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
            New Comparison
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export PNG
          </Button>
          <Button variant="outline" onClick={handleToggleFavorite}>
            {isFavorite(favoriteKey) ? (
              <HeartOff className="h-4 w-4 text-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {isFavorite(favoriteKey) ? "Unfavorite" : "Favorite"}
          </Button>
        </div>

        {/* Export Container */}
        <div ref={exportRef} className="space-y-8">
          {/* Country Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Country A Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden border-emerald-500/20 bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-3">
                    {countriesLoading ? (
                      <Skeleton className="h-10 w-16" />
                    ) : (
                      <img 
                        src={countryA?.flagSvg ?? countryA?.flagPng ?? ""} 
                        alt={countryA?.nameCommon ?? "Country A"}
                        className="h-10 w-16 rounded object-cover shadow"
                      />
                    )}
                    <div>
                      {countriesLoading ? (
                        <Skeleton className="h-6 w-32" />
                      ) : (
                        <>
                          <div className="text-xl">{countryA?.nameCommon ?? "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{countryA?.cca3}</div>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <InfoRow label="Capital" value={countryA?.capital ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Region" value={`${countryA?.region ?? ""}${countryA?.subregion ? ` / ${countryA.subregion}` : ""}` || "N/A"} loading={countriesLoading} />
                  <InfoRow label="Population" value={formatNumber(countryA?.population) ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Area" value={countryA?.area ? `${formatNumber(countryA.area)} km²` : "N/A"} loading={countriesLoading} />
                  <InfoRow label="Currency" value={formatCurrency(countryA?.currencies) ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Languages" value={formatLanguages(countryA?.languages) ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Timezones" value={countryA?.timezones?.slice(0, 2).join(", ") ?? "N/A"} loading={countriesLoading} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Country B Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden border-blue-500/20 bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-3">
                    {countriesLoading ? (
                      <Skeleton className="h-10 w-16" />
                    ) : (
                      <img 
                        src={countryB?.flagSvg ?? countryB?.flagPng ?? ""} 
                        alt={countryB?.nameCommon ?? "Country B"}
                        className="h-10 w-16 rounded object-cover shadow"
                      />
                    )}
                    <div>
                      {countriesLoading ? (
                        <Skeleton className="h-6 w-32" />
                      ) : (
                        <>
                          <div className="text-xl">{countryB?.nameCommon ?? "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{countryB?.cca3}</div>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <InfoRow label="Capital" value={countryB?.capital ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Region" value={`${countryB?.region ?? ""}${countryB?.subregion ? ` / ${countryB.subregion}` : ""}` || "N/A"} loading={countriesLoading} />
                  <InfoRow label="Population" value={formatNumber(countryB?.population) ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Area" value={countryB?.area ? `${formatNumber(countryB.area)} km²` : "N/A"} loading={countriesLoading} />
                  <InfoRow label="Currency" value={formatCurrency(countryB?.currencies) ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Languages" value={formatLanguages(countryB?.languages) ?? "N/A"} loading={countriesLoading} />
                  <InfoRow label="Timezones" value={countryB?.timezones?.slice(0, 2).join(", ") ?? "N/A"} loading={countriesLoading} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>📊 Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 py-2 border-b border-border text-sm font-semibold">
                <div>Metric</div>
                <div className="text-center text-emerald-500">{countryA?.nameCommon ?? "Country A"}</div>
                <div className="text-center text-blue-500">{countryB?.nameCommon ?? "Country B"}</div>
                <div className="text-right">Winner</div>
              </div>
              
              <CompareRow label="Population" valueA={countryA?.population} valueB={countryB?.population} />
              <CompareRow label="Area (km²)" valueA={countryA?.area} valueB={countryB?.area} />
              <CompareRow label="GDP ($)" valueA={wbDataA?.gdp} valueB={wbDataB?.gdp} />
              <CompareRow label="GDP per Capita ($)" valueA={wbDataA?.gdpPerCapita} valueB={wbDataB?.gdpPerCapita} />
              <CompareRow label="Life Expectancy (yrs)" valueA={wbDataA?.lifeExpectancy} valueB={wbDataB?.lifeExpectancy} />
              <CompareRow label="Birth Rate" valueA={wbDataA?.birthRate} valueB={wbDataB?.birthRate} higherIsBetter={false} />
              <CompareRow label="Death Rate" valueA={wbDataA?.deathRate} valueB={wbDataB?.deathRate} higherIsBetter={false} />
              <CompareRow label="Internet Users (%)" valueA={wbDataA?.internetUsers} valueB={wbDataB?.internetUsers} />
              <CompareRow label="CO2 Emissions (per capita)" valueA={wbDataA?.co2Emissions} valueB={wbDataB?.co2Emissions} higherIsBetter={false} />
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Population & Area Chart */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>📈 Population & Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => formatNumber(value)}
                      />
                      <Legend />
                      <Bar dataKey={countryA?.nameCommon ?? "A"} fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={countryB?.nameCommon ?? "B"} fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* GDP Chart */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>💰 Economic Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gdpChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => formatNumber(value)}
                      />
                      <Legend />
                      <Bar dataKey={countryA?.nameCommon ?? "A"} fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={countryB?.nameCommon ?? "B"} fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Health Chart */}
            <Card className="bg-card/80 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>🏥 Health Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      <Bar dataKey={countryA?.nameCommon ?? "A"} fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={countryB?.nameCommon ?? "B"} fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const InfoRow = ({ label, value, loading }: { label: string; value?: string; loading?: boolean }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    {loading ? (
      <Skeleton className="h-4 w-24" />
    ) : (
      <span className="font-medium">{value || "N/A"}</span>
    )}
  </div>
);

export default Compare;
