import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import {
  getFavorites,
  addToFavorites as addFavoriteLS,
  removeFromFavorites as removeFavoriteLS,
  saveFavorites,
} from "../utils/localStorage";
import { STORAGE_KEYS } from "../utils/constants";

function getFavoritesKey(userId = null) {
  return userId ? `my-cms-favorites-${userId}` : "my-cms-favorites-guest";
}

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {

  const [favorites, setFavorites] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const userId = user?.id || null;
    const storedFavorites = getFavorites(userId);

    const oldFavorites = localStorage.getItem("favorites");
    if (oldFavorites && !localStorage.getItem(getFavoritesKey(userId))) {
      const parsed = JSON.parse(oldFavorites);
      if (Array.isArray(parsed)) {
        saveFavorites(parsed, userId);
        localStorage.removeItem("favorites");
        setFavorites(parsed);
        return;
      }
    }

    setFavorites(storedFavorites);
  }, [user]);

  const addToFavorites = (product) => {

    const userId = user?.id || null;

    const updatedFavorites = addFavoriteLS(product, userId);

    setFavorites(updatedFavorites);

    return updatedFavorites;
  };

  const removeFromFavorites = (productId) => {

    const userId = user?.id || null;

    const updatedFavorites = removeFavoriteLS(productId, userId);

    setFavorites(updatedFavorites);

    return updatedFavorites;
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {

      removeFromFavorites(product.id);
      return false;
    } else {

      addToFavorites(product);
      return true;
    }
  };

  const isFavorite = (productId) => {
    return favorites.some((p) => p.id === productId);
  };

  const getFavoriteCount = () => {
    return favorites.length;
  };

  const clearFavorites = () => {

    const userId = user?.id || null;

    const key = getFavoritesKey(userId);
    localStorage.removeItem(key);

    setFavorites([]);
  };

  const value = {

    favorites, // Mảng product objects

    addToFavorites, // Thêm vào favorites
    removeFromFavorites, // Xóa khỏi favorites
    toggleFavorite, // Toggle favorite status
    isFavorite, // Check có trong favorites không
    getFavoriteCount, // Đếm số lượng
    clearFavorites, // Xóa tất cả
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);

  if (!context) {
    throw new Error("useFavorite must be used within FavoriteProvider");
  }

  return context;
}

export default FavoriteContext;
