import { useQuery } from "@tanstack/react-query";

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

const fetchCountries = async (): Promise<Country[]> => {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,cca3,flags,capital,region,subregion,population,area,currencies,languages,timezones,maps"
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Map to only the fields we need and sort A-Z
  return data
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
};

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
