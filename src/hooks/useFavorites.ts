import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "tulaa_favorites";

export interface FavoriteComparison {
  id: string;
  countryA: string;
  countryB: string;
  createdAt: number;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteComparison[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load favorites:", e);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavorites: FavoriteComparison[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (e) {
      console.warn("Failed to save favorites:", e);
    }
  }, []);

  // Add a new favorite
  const addFavorite = useCallback(
    (countryA: string, countryB: string) => {
      const id = `${countryA}-${countryB}`;
      
      // Check if already exists
      if (favorites.some((f) => f.id === id || f.id === `${countryB}-${countryA}`)) {
        return false;
      }

      const newFavorite: FavoriteComparison = {
        id,
        countryA,
        countryB,
        createdAt: Date.now(),
      };

      saveFavorites([newFavorite, ...favorites]);
      return true;
    },
    [favorites, saveFavorites]
  );

  // Remove a favorite
  const removeFavorite = useCallback(
    (id: string) => {
      saveFavorites(favorites.filter((f) => f.id !== id));
    },
    [favorites, saveFavorites]
  );

  // Check if a comparison is favorited
  const isFavorite = useCallback(
    (countryA: string, countryB: string) => {
      return favorites.some(
        (f) =>
          f.id === `${countryA}-${countryB}` ||
          f.id === `${countryB}-${countryA}`
      );
    },
    [favorites]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    (countryA: string, countryB: string) => {
      if (isFavorite(countryA, countryB)) {
        const id = favorites.find(
          (f) =>
            f.id === `${countryA}-${countryB}` ||
            f.id === `${countryB}-${countryA}`
        )?.id;
        if (id) {
          removeFavorite(id);
          return false;
        }
      } else {
        addFavorite(countryA, countryB);
        return true;
      }
      return false;
    },
    [favorites, isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
