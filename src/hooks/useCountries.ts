import { useQuery } from "@tanstack/react-query";
import { fallbackCountries, FallbackCountry } from "@/data/fallbackCountries";
import { useState, useEffect } from "react";

export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca3: string;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area: number;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  timezones: string[];
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
}

const CACHE_KEY = "countries_cache";
const API_URL = "https://restcountries.com/v3.1/all?fields=name,cca3,flags,capital,region,subregion,population,area,currencies,languages,timezones,maps";

// Get cached countries from localStorage
const getCachedCountries = (): Country[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to parse cached countries:", e);
  }
  return null;
};

// Save countries to localStorage cache
const setCachedCountries = (countries: Country[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(countries));
  } catch (e) {
    console.warn("Failed to cache countries:", e);
  }
};

// Convert fallback countries to Country type
const getFallbackAsCountries = (): Country[] => {
  return fallbackCountries.map((c: FallbackCountry) => ({
    name: c.name,
    cca3: c.cca3,
    flags: c.flags,
    capital: c.capital,
    region: c.region,
    subregion: c.subregion,
    population: c.population,
    area: c.area,
    currencies: c.currencies,
    languages: c.languages,
    timezones: c.timezones,
    maps: c.maps,
  }));
};

const fetchCountries = async (): Promise<Country[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(API_URL, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    const data = await response.json();

    // Map and sort the data
    const countries: Country[] = data
      .map((country: any) => ({
        name: country.name,
        cca3: country.cca3,
        flags: country.flags,
        capital: country.capital,
        region: country.region,
        subregion: country.subregion,
        population: country.population,
        area: country.area,
        currencies: country.currencies,
        languages: country.languages,
        timezones: country.timezones,
        maps: country.maps,
      }))
      .sort((a: Country, b: Country) =>
        a.name.common.localeCompare(b.name.common)
      );

    // Cache the successful response
    setCachedCountries(countries);

    return countries;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Try to get from localStorage cache
    const cached = getCachedCountries();
    if (cached) {
      console.log("Using cached countries from localStorage");
      return cached;
    }

    // Fall back to static fallback data
    console.log("Using fallback countries data");
    return getFallbackAsCountries();
  }
};

export const useCountries = () => {
  const [usingFallback, setUsingFallback] = useState(false);

  const query = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Check if we're using fallback data
  useEffect(() => {
    if (query.data) {
      const cached = getCachedCountries();
      // If we have data but it matches fallback length and no cache, we're using fallback
      if (!cached && query.data.length <= fallbackCountries.length) {
        setUsingFallback(true);
      } else {
        setUsingFallback(false);
      }
    }
  }, [query.data]);

  return {
    ...query,
    usingFallback,
  };
};
