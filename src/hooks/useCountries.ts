import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// Normalized Country type - no nested objects for UI usage
export interface Country {
  cca3: string;
  nameCommon: string;
  flagSvg?: string;
  flagPng?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  currencies?: Record<string, { name: string; symbol?: string }>;
  languages?: Record<string, string>;
  timezones?: string[];
}

const CACHE_KEY = "countries_cache";
const API_URL = "https://restcountries.com/v3.1/all?fields=name,cca3,flags,capital,region,subregion,population,area,currencies,languages,timezones";

// Fallback countries for when API and cache fail
const FALLBACK_COUNTRIES: Country[] = [
  { cca3: "IND", nameCommon: "India", flagSvg: "https://flagcdn.com/in.svg", flagPng: "https://flagcdn.com/w320/in.png", capital: "New Delhi", region: "Asia", subregion: "Southern Asia", population: 1380004385, area: 3287263, currencies: { INR: { name: "Indian rupee", symbol: "₹" } }, languages: { eng: "English", hin: "Hindi" }, timezones: ["UTC+05:30"] },
  { cca3: "USA", nameCommon: "United States", flagSvg: "https://flagcdn.com/us.svg", flagPng: "https://flagcdn.com/w320/us.png", capital: "Washington, D.C.", region: "Americas", subregion: "Northern America", population: 329484123, area: 9833520, currencies: { USD: { name: "United States dollar", symbol: "$" } }, languages: { eng: "English" }, timezones: ["UTC-05:00"] },
  { cca3: "CHN", nameCommon: "China", flagSvg: "https://flagcdn.com/cn.svg", flagPng: "https://flagcdn.com/w320/cn.png", capital: "Beijing", region: "Asia", subregion: "Eastern Asia", population: 1439323776, area: 9706961, currencies: { CNY: { name: "Chinese yuan", symbol: "¥" } }, languages: { zho: "Chinese" }, timezones: ["UTC+08:00"] },
  { cca3: "GBR", nameCommon: "United Kingdom", flagSvg: "https://flagcdn.com/gb.svg", flagPng: "https://flagcdn.com/w320/gb.png", capital: "London", region: "Europe", subregion: "Northern Europe", population: 67215293, area: 242900, currencies: { GBP: { name: "British pound", symbol: "£" } }, languages: { eng: "English" }, timezones: ["UTC"] },
  { cca3: "FRA", nameCommon: "France", flagSvg: "https://flagcdn.com/fr.svg", flagPng: "https://flagcdn.com/w320/fr.png", capital: "Paris", region: "Europe", subregion: "Western Europe", population: 67390000, area: 551695, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { fra: "French" }, timezones: ["UTC+01:00"] },
  { cca3: "DEU", nameCommon: "Germany", flagSvg: "https://flagcdn.com/de.svg", flagPng: "https://flagcdn.com/w320/de.png", capital: "Berlin", region: "Europe", subregion: "Western Europe", population: 83240525, area: 357114, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { deu: "German" }, timezones: ["UTC+01:00"] },
  { cca3: "JPN", nameCommon: "Japan", flagSvg: "https://flagcdn.com/jp.svg", flagPng: "https://flagcdn.com/w320/jp.png", capital: "Tokyo", region: "Asia", subregion: "Eastern Asia", population: 125836021, area: 377930, currencies: { JPY: { name: "Japanese yen", symbol: "¥" } }, languages: { jpn: "Japanese" }, timezones: ["UTC+09:00"] },
  { cca3: "BRA", nameCommon: "Brazil", flagSvg: "https://flagcdn.com/br.svg", flagPng: "https://flagcdn.com/w320/br.png", capital: "Brasília", region: "Americas", subregion: "South America", population: 212559409, area: 8515767, currencies: { BRL: { name: "Brazilian real", symbol: "R$" } }, languages: { por: "Portuguese" }, timezones: ["UTC-03:00"] },
  { cca3: "RUS", nameCommon: "Russia", flagSvg: "https://flagcdn.com/ru.svg", flagPng: "https://flagcdn.com/w320/ru.png", capital: "Moscow", region: "Europe", subregion: "Eastern Europe", population: 144104080, area: 17098242, currencies: { RUB: { name: "Russian ruble", symbol: "₽" } }, languages: { rus: "Russian" }, timezones: ["UTC+03:00"] },
  { cca3: "CAN", nameCommon: "Canada", flagSvg: "https://flagcdn.com/ca.svg", flagPng: "https://flagcdn.com/w320/ca.png", capital: "Ottawa", region: "Americas", subregion: "Northern America", population: 38005238, area: 9984670, currencies: { CAD: { name: "Canadian dollar", symbol: "$" } }, languages: { eng: "English", fra: "French" }, timezones: ["UTC-05:00"] },
  { cca3: "AUS", nameCommon: "Australia", flagSvg: "https://flagcdn.com/au.svg", flagPng: "https://flagcdn.com/w320/au.png", capital: "Canberra", region: "Oceania", subregion: "Australia and New Zealand", population: 25687041, area: 7692024, currencies: { AUD: { name: "Australian dollar", symbol: "$" } }, languages: { eng: "English" }, timezones: ["UTC+10:00"] },
  { cca3: "MEX", nameCommon: "Mexico", flagSvg: "https://flagcdn.com/mx.svg", flagPng: "https://flagcdn.com/w320/mx.png", capital: "Mexico City", region: "Americas", subregion: "North America", population: 128932753, area: 1964375, currencies: { MXN: { name: "Mexican peso", symbol: "$" } }, languages: { spa: "Spanish" }, timezones: ["UTC-06:00"] },
  { cca3: "KOR", nameCommon: "South Korea", flagSvg: "https://flagcdn.com/kr.svg", flagPng: "https://flagcdn.com/w320/kr.png", capital: "Seoul", region: "Asia", subregion: "Eastern Asia", population: 51780579, area: 100210, currencies: { KRW: { name: "South Korean won", symbol: "₩" } }, languages: { kor: "Korean" }, timezones: ["UTC+09:00"] },
  { cca3: "ITA", nameCommon: "Italy", flagSvg: "https://flagcdn.com/it.svg", flagPng: "https://flagcdn.com/w320/it.png", capital: "Rome", region: "Europe", subregion: "Southern Europe", population: 59554023, area: 301336, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { ita: "Italian" }, timezones: ["UTC+01:00"] },
  { cca3: "ESP", nameCommon: "Spain", flagSvg: "https://flagcdn.com/es.svg", flagPng: "https://flagcdn.com/w320/es.png", capital: "Madrid", region: "Europe", subregion: "Southern Europe", population: 47351567, area: 505992, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { spa: "Spanish" }, timezones: ["UTC+01:00"] },
  { cca3: "IDN", nameCommon: "Indonesia", flagSvg: "https://flagcdn.com/id.svg", flagPng: "https://flagcdn.com/w320/id.png", capital: "Jakarta", region: "Asia", subregion: "South-Eastern Asia", population: 273523621, area: 1904569, currencies: { IDR: { name: "Indonesian rupiah", symbol: "Rp" } }, languages: { ind: "Indonesian" }, timezones: ["UTC+07:00"] },
  { cca3: "TUR", nameCommon: "Turkey", flagSvg: "https://flagcdn.com/tr.svg", flagPng: "https://flagcdn.com/w320/tr.png", capital: "Ankara", region: "Asia", subregion: "Western Asia", population: 84339067, area: 783562, currencies: { TRY: { name: "Turkish lira", symbol: "₺" } }, languages: { tur: "Turkish" }, timezones: ["UTC+03:00"] },
  { cca3: "SAU", nameCommon: "Saudi Arabia", flagSvg: "https://flagcdn.com/sa.svg", flagPng: "https://flagcdn.com/w320/sa.png", capital: "Riyadh", region: "Asia", subregion: "Western Asia", population: 34813867, area: 2149690, currencies: { SAR: { name: "Saudi riyal", symbol: "ر.س" } }, languages: { ara: "Arabic" }, timezones: ["UTC+03:00"] },
  { cca3: "NGA", nameCommon: "Nigeria", flagSvg: "https://flagcdn.com/ng.svg", flagPng: "https://flagcdn.com/w320/ng.png", capital: "Abuja", region: "Africa", subregion: "Western Africa", population: 206139587, area: 923768, currencies: { NGN: { name: "Nigerian naira", symbol: "₦" } }, languages: { eng: "English" }, timezones: ["UTC+01:00"] },
  { cca3: "EGY", nameCommon: "Egypt", flagSvg: "https://flagcdn.com/eg.svg", flagPng: "https://flagcdn.com/w320/eg.png", capital: "Cairo", region: "Africa", subregion: "Northern Africa", population: 102334403, area: 1002450, currencies: { EGP: { name: "Egyptian pound", symbol: "£" } }, languages: { ara: "Arabic" }, timezones: ["UTC+02:00"] },
  { cca3: "ZAF", nameCommon: "South Africa", flagSvg: "https://flagcdn.com/za.svg", flagPng: "https://flagcdn.com/w320/za.png", capital: "Pretoria", region: "Africa", subregion: "Southern Africa", population: 59308690, area: 1221037, currencies: { ZAR: { name: "South African rand", symbol: "R" } }, languages: { eng: "English" }, timezones: ["UTC+02:00"] },
  { cca3: "ARG", nameCommon: "Argentina", flagSvg: "https://flagcdn.com/ar.svg", flagPng: "https://flagcdn.com/w320/ar.png", capital: "Buenos Aires", region: "Americas", subregion: "South America", population: 45376763, area: 2780400, currencies: { ARS: { name: "Argentine peso", symbol: "$" } }, languages: { spa: "Spanish" }, timezones: ["UTC-03:00"] },
  { cca3: "POL", nameCommon: "Poland", flagSvg: "https://flagcdn.com/pl.svg", flagPng: "https://flagcdn.com/w320/pl.png", capital: "Warsaw", region: "Europe", subregion: "Central Europe", population: 37950802, area: 312679, currencies: { PLN: { name: "Polish złoty", symbol: "zł" } }, languages: { pol: "Polish" }, timezones: ["UTC+01:00"] },
  { cca3: "THA", nameCommon: "Thailand", flagSvg: "https://flagcdn.com/th.svg", flagPng: "https://flagcdn.com/w320/th.png", capital: "Bangkok", region: "Asia", subregion: "South-Eastern Asia", population: 69799978, area: 513120, currencies: { THB: { name: "Thai baht", symbol: "฿" } }, languages: { tha: "Thai" }, timezones: ["UTC+07:00"] },
  { cca3: "VNM", nameCommon: "Vietnam", flagSvg: "https://flagcdn.com/vn.svg", flagPng: "https://flagcdn.com/w320/vn.png", capital: "Hanoi", region: "Asia", subregion: "South-Eastern Asia", population: 97338583, area: 331212, currencies: { VND: { name: "Vietnamese đồng", symbol: "₫" } }, languages: { vie: "Vietnamese" }, timezones: ["UTC+07:00"] },
  { cca3: "PAK", nameCommon: "Pakistan", flagSvg: "https://flagcdn.com/pk.svg", flagPng: "https://flagcdn.com/w320/pk.png", capital: "Islamabad", region: "Asia", subregion: "Southern Asia", population: 220892331, area: 881912, currencies: { PKR: { name: "Pakistani rupee", symbol: "₨" } }, languages: { eng: "English", urd: "Urdu" }, timezones: ["UTC+05:00"] },
  { cca3: "BGD", nameCommon: "Bangladesh", flagSvg: "https://flagcdn.com/bd.svg", flagPng: "https://flagcdn.com/w320/bd.png", capital: "Dhaka", region: "Asia", subregion: "Southern Asia", population: 164689383, area: 147570, currencies: { BDT: { name: "Bangladeshi taka", symbol: "৳" } }, languages: { ben: "Bengali" }, timezones: ["UTC+06:00"] },
  { cca3: "PHL", nameCommon: "Philippines", flagSvg: "https://flagcdn.com/ph.svg", flagPng: "https://flagcdn.com/w320/ph.png", capital: "Manila", region: "Asia", subregion: "South-Eastern Asia", population: 109581085, area: 342353, currencies: { PHP: { name: "Philippine peso", symbol: "₱" } }, languages: { eng: "English", fil: "Filipino" }, timezones: ["UTC+08:00"] },
  { cca3: "MYS", nameCommon: "Malaysia", flagSvg: "https://flagcdn.com/my.svg", flagPng: "https://flagcdn.com/w320/my.png", capital: "Kuala Lumpur", region: "Asia", subregion: "South-Eastern Asia", population: 32365998, area: 330803, currencies: { MYR: { name: "Malaysian ringgit", symbol: "RM" } }, languages: { eng: "English", msa: "Malay" }, timezones: ["UTC+08:00"] },
  { cca3: "NLD", nameCommon: "Netherlands", flagSvg: "https://flagcdn.com/nl.svg", flagPng: "https://flagcdn.com/w320/nl.png", capital: "Amsterdam", region: "Europe", subregion: "Western Europe", population: 17441139, area: 41850, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { nld: "Dutch" }, timezones: ["UTC+01:00"] },
  { cca3: "SWE", nameCommon: "Sweden", flagSvg: "https://flagcdn.com/se.svg", flagPng: "https://flagcdn.com/w320/se.png", capital: "Stockholm", region: "Europe", subregion: "Northern Europe", population: 10353442, area: 450295, currencies: { SEK: { name: "Swedish krona", symbol: "kr" } }, languages: { swe: "Swedish" }, timezones: ["UTC+01:00"] },
  { cca3: "CHE", nameCommon: "Switzerland", flagSvg: "https://flagcdn.com/ch.svg", flagPng: "https://flagcdn.com/w320/ch.png", capital: "Bern", region: "Europe", subregion: "Western Europe", population: 8654622, area: 41284, currencies: { CHF: { name: "Swiss franc", symbol: "Fr." } }, languages: { deu: "German", fra: "French", ita: "Italian" }, timezones: ["UTC+01:00"] },
  { cca3: "NOR", nameCommon: "Norway", flagSvg: "https://flagcdn.com/no.svg", flagPng: "https://flagcdn.com/w320/no.png", capital: "Oslo", region: "Europe", subregion: "Northern Europe", population: 5379475, area: 323802, currencies: { NOK: { name: "Norwegian krone", symbol: "kr" } }, languages: { nno: "Norwegian Nynorsk", nob: "Norwegian Bokmål" }, timezones: ["UTC+01:00"] },
  { cca3: "DNK", nameCommon: "Denmark", flagSvg: "https://flagcdn.com/dk.svg", flagPng: "https://flagcdn.com/w320/dk.png", capital: "Copenhagen", region: "Europe", subregion: "Northern Europe", population: 5831404, area: 43094, currencies: { DKK: { name: "Danish krone", symbol: "kr" } }, languages: { dan: "Danish" }, timezones: ["UTC+01:00"] },
  { cca3: "FIN", nameCommon: "Finland", flagSvg: "https://flagcdn.com/fi.svg", flagPng: "https://flagcdn.com/w320/fi.png", capital: "Helsinki", region: "Europe", subregion: "Northern Europe", population: 5530719, area: 338424, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { fin: "Finnish", swe: "Swedish" }, timezones: ["UTC+02:00"] },
  { cca3: "NZL", nameCommon: "New Zealand", flagSvg: "https://flagcdn.com/nz.svg", flagPng: "https://flagcdn.com/w320/nz.png", capital: "Wellington", region: "Oceania", subregion: "Australia and New Zealand", population: 5084300, area: 270467, currencies: { NZD: { name: "New Zealand dollar", symbol: "$" } }, languages: { eng: "English", mri: "Māori" }, timezones: ["UTC+12:00"] },
  { cca3: "SGP", nameCommon: "Singapore", flagSvg: "https://flagcdn.com/sg.svg", flagPng: "https://flagcdn.com/w320/sg.png", capital: "Singapore", region: "Asia", subregion: "South-Eastern Asia", population: 5685807, area: 710, currencies: { SGD: { name: "Singapore dollar", symbol: "$" } }, languages: { eng: "English", zho: "Chinese", msa: "Malay", tam: "Tamil" }, timezones: ["UTC+08:00"] },
  { cca3: "ARE", nameCommon: "United Arab Emirates", flagSvg: "https://flagcdn.com/ae.svg", flagPng: "https://flagcdn.com/w320/ae.png", capital: "Abu Dhabi", region: "Asia", subregion: "Western Asia", population: 9890400, area: 83600, currencies: { AED: { name: "United Arab Emirates dirham", symbol: "د.إ" } }, languages: { ara: "Arabic" }, timezones: ["UTC+04:00"] },
  { cca3: "ISR", nameCommon: "Israel", flagSvg: "https://flagcdn.com/il.svg", flagPng: "https://flagcdn.com/w320/il.png", capital: "Jerusalem", region: "Asia", subregion: "Western Asia", population: 9216900, area: 20770, currencies: { ILS: { name: "Israeli new shekel", symbol: "₪" } }, languages: { ara: "Arabic", heb: "Hebrew" }, timezones: ["UTC+02:00"] },
  { cca3: "PRT", nameCommon: "Portugal", flagSvg: "https://flagcdn.com/pt.svg", flagPng: "https://flagcdn.com/w320/pt.png", capital: "Lisbon", region: "Europe", subregion: "Southern Europe", population: 10305564, area: 92090, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { por: "Portuguese" }, timezones: ["UTC"] },
  { cca3: "GRC", nameCommon: "Greece", flagSvg: "https://flagcdn.com/gr.svg", flagPng: "https://flagcdn.com/w320/gr.png", capital: "Athens", region: "Europe", subregion: "Southern Europe", population: 10715549, area: 131990, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { ell: "Greek" }, timezones: ["UTC+02:00"] },
  { cca3: "AUT", nameCommon: "Austria", flagSvg: "https://flagcdn.com/at.svg", flagPng: "https://flagcdn.com/w320/at.png", capital: "Vienna", region: "Europe", subregion: "Central Europe", population: 8917205, area: 83871, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { deu: "German" }, timezones: ["UTC+01:00"] },
  { cca3: "BEL", nameCommon: "Belgium", flagSvg: "https://flagcdn.com/be.svg", flagPng: "https://flagcdn.com/w320/be.png", capital: "Brussels", region: "Europe", subregion: "Western Europe", population: 11555997, area: 30528, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { deu: "German", fra: "French", nld: "Dutch" }, timezones: ["UTC+01:00"] },
  { cca3: "CZE", nameCommon: "Czechia", flagSvg: "https://flagcdn.com/cz.svg", flagPng: "https://flagcdn.com/w320/cz.png", capital: "Prague", region: "Europe", subregion: "Central Europe", population: 10708981, area: 78865, currencies: { CZK: { name: "Czech koruna", symbol: "Kč" } }, languages: { ces: "Czech" }, timezones: ["UTC+01:00"] },
  { cca3: "IRL", nameCommon: "Ireland", flagSvg: "https://flagcdn.com/ie.svg", flagPng: "https://flagcdn.com/w320/ie.png", capital: "Dublin", region: "Europe", subregion: "Northern Europe", population: 4994724, area: 70273, currencies: { EUR: { name: "Euro", symbol: "€" } }, languages: { eng: "English", gle: "Irish" }, timezones: ["UTC"] },
  { cca3: "UKR", nameCommon: "Ukraine", flagSvg: "https://flagcdn.com/ua.svg", flagPng: "https://flagcdn.com/w320/ua.png", capital: "Kyiv", region: "Europe", subregion: "Eastern Europe", population: 44134693, area: 603500, currencies: { UAH: { name: "Ukrainian hryvnia", symbol: "₴" } }, languages: { ukr: "Ukrainian" }, timezones: ["UTC+02:00"] },
  { cca3: "COL", nameCommon: "Colombia", flagSvg: "https://flagcdn.com/co.svg", flagPng: "https://flagcdn.com/w320/co.png", capital: "Bogotá", region: "Americas", subregion: "South America", population: 50882884, area: 1141748, currencies: { COP: { name: "Colombian peso", symbol: "$" } }, languages: { spa: "Spanish" }, timezones: ["UTC-05:00"] },
  { cca3: "PER", nameCommon: "Peru", flagSvg: "https://flagcdn.com/pe.svg", flagPng: "https://flagcdn.com/w320/pe.png", capital: "Lima", region: "Americas", subregion: "South America", population: 32971846, area: 1285216, currencies: { PEN: { name: "Peruvian sol", symbol: "S/ " } }, languages: { spa: "Spanish" }, timezones: ["UTC-05:00"] },
  { cca3: "CHL", nameCommon: "Chile", flagSvg: "https://flagcdn.com/cl.svg", flagPng: "https://flagcdn.com/w320/cl.png", capital: "Santiago", region: "Americas", subregion: "South America", population: 19116209, area: 756102, currencies: { CLP: { name: "Chilean peso", symbol: "$" } }, languages: { spa: "Spanish" }, timezones: ["UTC-04:00"] },
].sort((a, b) => a.nameCommon.localeCompare(b.nameCommon));

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

// Normalize API response to Country type
const normalizeCountry = (raw: any): Country => ({
  cca3: raw.cca3 ?? "UNK",
  nameCommon: raw.name?.common ?? "Unknown",
  flagSvg: raw.flags?.svg,
  flagPng: raw.flags?.png,
  capital: Array.isArray(raw.capital) ? raw.capital[0] : raw.capital,
  region: raw.region,
  subregion: raw.subregion,
  population: raw.population,
  area: raw.area,
  currencies: raw.currencies,
  languages: raw.languages,
  timezones: raw.timezones,
});

const fetchCountries = async (): Promise<{ countries: Country[]; fromFallback: boolean }> => {
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

    // Map and normalize the data
    const countries: Country[] = data
      .map(normalizeCountry)
      .sort((a: Country, b: Country) => a.nameCommon.localeCompare(b.nameCommon));

    // Cache the successful response
    setCachedCountries(countries);

    return { countries, fromFallback: false };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("API fetch failed:", error);
    
    // Try to get from localStorage cache
    const cached = getCachedCountries();
    if (cached && cached.length > 0) {
      console.log("Using cached countries from localStorage");
      return { countries: cached, fromFallback: false };
    }

    // Fall back to static fallback data
    console.log("Using fallback countries data");
    return { countries: FALLBACK_COUNTRIES, fromFallback: true };
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
    select: (data) => data.countries,
  });

  // Track fallback status from the query result
  useEffect(() => {
    if (query.data) {
      // Access the raw data before select transform
      const rawData = query.data as unknown as { countries: Country[]; fromFallback: boolean } | Country[];
      if (rawData && typeof rawData === 'object' && 'fromFallback' in rawData) {
        setUsingFallback(rawData.fromFallback);
      }
    }
  }, [query.data]);

  // Also check on initial cache restoration
  useEffect(() => {
    const checkFallback = async () => {
      try {
        const cached = getCachedCountries();
        if (!cached && query.data && query.data.length <= FALLBACK_COUNTRIES.length) {
          setUsingFallback(true);
        }
      } catch {
        // Ignore errors
      }
    };
    checkFallback();
  }, [query.data]);

  return {
    ...query,
    data: query.data ?? [],
    usingFallback,
  };
};
