import { useQuery } from "@tanstack/react-query";

export interface WorldBankIndicator {
  gdp?: number;
  gdpPerCapita?: number;
  lifeExpectancy?: number;
  birthRate?: number;
  deathRate?: number;
  fertilityRate?: number;
  internetUsers?: number;
  co2Emissions?: number;
  lifeExpectancyTrend?: { year: number; value: number }[];
}

const INDICATORS = {
  gdp: "NY.GDP.MKTP.CD",
  gdpPerCapita: "NY.GDP.PCAP.CD",
  lifeExpectancy: "SP.DYN.LE00.IN",
  birthRate: "SP.DYN.CBRT.IN",
  deathRate: "SP.DYN.CDRT.IN",
  fertilityRate: "SP.DYN.TFRT.IN",
  internetUsers: "IT.NET.USER.ZS",
  co2Emissions: "EN.ATM.CO2E.PC",
};

// Map ISO3 codes to World Bank codes (some differ)
const getWorldBankCode = (cca3: string): string => {
  const codeMap: Record<string, string> = {
    // Most codes are the same, but some exceptions exist
    ROM: "ROU", // Romania
    TMP: "TLS", // Timor-Leste
    ZAR: "COD", // DR Congo
  };
  return codeMap[cca3] || cca3;
};

const fetchIndicator = async (
  countryCode: string,
  indicator: string
): Promise<number | null> => {
  try {
    const wbCode = getWorldBankCode(countryCode);
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${wbCode}/indicator/${indicator}?format=json&per_page=20`
    );

    if (!response.ok) return null;

    const data = await response.json();

    // World Bank returns [metadata, data] array
    if (!data || !Array.isArray(data) || data.length < 2 || !data[1]) {
      return null;
    }

    // Find the most recent non-null value
    const values = data[1];
    for (const entry of values) {
      if (entry.value !== null && entry.value !== undefined) {
        return entry.value;
      }
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch indicator ${indicator} for ${countryCode}:`, error);
    return null;
  }
};

const fetchLifeExpectancyTrend = async (
  countryCode: string
): Promise<{ year: number; value: number }[]> => {
  try {
    const wbCode = getWorldBankCode(countryCode);
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${wbCode}/indicator/${INDICATORS.lifeExpectancy}?format=json&per_page=15`
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length < 2 || !data[1]) {
      return [];
    }

    // Get last 10 years with valid data
    const trend = data[1]
      .filter((entry: any) => entry.value !== null)
      .slice(0, 10)
      .map((entry: any) => ({
        year: parseInt(entry.date),
        value: entry.value,
      }))
      .reverse();

    return trend;
  } catch (error) {
    console.warn(`Failed to fetch life expectancy trend for ${countryCode}:`, error);
    return [];
  }
};

const fetchWorldBankData = async (countryCode: string): Promise<WorldBankIndicator> => {
  // Fetch all indicators in parallel
  const [
    gdp,
    gdpPerCapita,
    lifeExpectancy,
    birthRate,
    deathRate,
    fertilityRate,
    internetUsers,
    co2Emissions,
    lifeExpectancyTrend,
  ] = await Promise.all([
    fetchIndicator(countryCode, INDICATORS.gdp),
    fetchIndicator(countryCode, INDICATORS.gdpPerCapita),
    fetchIndicator(countryCode, INDICATORS.lifeExpectancy),
    fetchIndicator(countryCode, INDICATORS.birthRate),
    fetchIndicator(countryCode, INDICATORS.deathRate),
    fetchIndicator(countryCode, INDICATORS.fertilityRate),
    fetchIndicator(countryCode, INDICATORS.internetUsers),
    fetchIndicator(countryCode, INDICATORS.co2Emissions),
    fetchLifeExpectancyTrend(countryCode),
  ]);

  return {
    gdp: gdp ?? undefined,
    gdpPerCapita: gdpPerCapita ?? undefined,
    lifeExpectancy: lifeExpectancy ?? undefined,
    birthRate: birthRate ?? undefined,
    deathRate: deathRate ?? undefined,
    fertilityRate: fertilityRate ?? undefined,
    internetUsers: internetUsers ?? undefined,
    co2Emissions: co2Emissions ?? undefined,
    lifeExpectancyTrend,
  };
};

export const useWorldBankData = (countryCode: string | undefined) => {
  return useQuery({
    queryKey: ["worldbank", countryCode],
    queryFn: () => fetchWorldBankData(countryCode!),
    enabled: !!countryCode,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
  });
};
