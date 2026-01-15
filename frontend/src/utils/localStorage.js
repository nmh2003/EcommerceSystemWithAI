import { STORAGE_KEYS } from "./constants";

export function saveToStorage(key, value) {
  try {

    const serializedValue = JSON.stringify(value);

    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
  }
}

export function getFromStorage(key, defaultValue = null) {
  try {

    const item = localStorage.getItem(key);

    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return defaultValue;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
  }
}

export function clearStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

export function saveUser(user) {
  saveToStorage(STORAGE_KEYS.USER, user);
}

export function getUser() {
  return getFromStorage(STORAGE_KEYS.USER, null);
}

export function removeUser() {
  removeFromStorage(STORAGE_KEYS.USER);
}

function getCartKey(userId = null) {
  return userId ? `my-cms-cart-${userId}` : "my-cms-cart-guest";
}

export function saveCart(cart, userId = null) {
  const key = getCartKey(userId);
  saveToStorage(key, cart);
}

export function getCart(userId = null) {
  const key = getCartKey(userId);
  return getFromStorage(key, []);
}

export function clearCart(userId = null) {
  const key = getCartKey(userId);
  removeFromStorage(key);
}

export function addToCart(product, qty = 1, userId = null) {

  const cart = getCart(userId);

  const existingItemIndex = cart.findIndex(
    (item) => item.product.id === product.id
  );

  if (existingItemIndex >= 0) {

    cart[existingItemIndex].qty += qty;
  } else {

    cart.push({
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        countInStock: product.countInStock,
      },
      qty,
    });
  }

  saveCart(cart, userId);

  return cart;
}

export function updateCartItemQty(productId, qty, userId = null) {
  const cart = getCart(userId);

  const itemIndex = cart.findIndex((item) => item.product.id === productId);

  if (itemIndex >= 0) {
    if (qty <= 0) {

      cart.splice(itemIndex, 1);
    } else {

      cart[itemIndex].qty = qty;
    }

    saveCart(cart, userId);
  }

  return cart;
}

export function removeFromCart(productId, userId = null) {
  let cart = getCart(userId);

  cart = cart.filter((item) => item.product.id !== productId);

  saveCart(cart, userId);

  return cart;
}

export function getCartTotal(userId = null) {
  const cart = getCart(userId);

  return cart.reduce((total, item) => {
    return total + item.product.price * item.qty;
  }, 0);
}

export function getCartItemCount(userId = null) {
  const cart = getCart(userId);

  return cart.reduce((count, item) => {
    return count + item.qty;
  }, 0);
}

function getFavoritesKey(userId = null) {
  return userId ? `my-cms-favorites-${userId}` : "my-cms-favorites-guest";
}

export function saveFavorites(favorites, userId = null) {
  const key = getFavoritesKey(userId);
  saveToStorage(key, favorites);
}

export function getFavorites(userId = null) {
  const key = getFavoritesKey(userId);
  return getFromStorage(key, []);
}

export function addToFavorites(product, userId = null) {
  const favorites = getFavorites(userId);

  if (!favorites.some((p) => p.id === product.id)) {
    favorites.push(product);
    saveFavorites(favorites, userId);
  }

  return favorites;
}

export function removeFromFavorites(productId, userId = null) {
  let favorites = getFavorites(userId);

  favorites = favorites.filter((p) => p.id !== productId);

  saveFavorites(favorites, userId);

  return favorites;
}

export function isFavorite(productId, userId = null) {
  const favorites = getFavorites(userId);
  return favorites.some((p) => p.id === productId);
}

export function saveTheme(theme) {
  saveToStorage(STORAGE_KEYS.THEME, theme);
}

export function getTheme() {
  return getFromStorage(STORAGE_KEYS.THEME, "light");
}

export function addRecentSearch(keyword, maxItems = 10) {

  let searches = getFromStorage(STORAGE_KEYS.RECENT_SEARCHES, []);

  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) return;

  searches = searches.filter((s) => s !== normalizedKeyword);

  searches.unshift(normalizedKeyword);

  if (searches.length > maxItems) {
    searches = searches.slice(0, maxItems);
  }

  saveToStorage(STORAGE_KEYS.RECENT_SEARCHES, searches);
}

export function getRecentSearches() {
  return getFromStorage(STORAGE_KEYS.RECENT_SEARCHES, []);
}

export function clearRecentSearches() {
  removeFromStorage(STORAGE_KEYS.RECENT_SEARCHES);
}

export default {

  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearStorage,

  saveUser,
  getUser,
  removeUser,

  saveCart: (cart, userId = null) => saveCart(cart, userId),
  getCart: (userId = null) => getCart(userId),
  clearCart: (userId = null) => clearCart(userId),
  addToCart: (product, qty = 1, userId = null) =>
    addToCart(product, qty, userId),
  updateCartItemQty: (productId, qty, userId = null) =>
    updateCartItemQty(productId, qty, userId),
  removeFromCart: (productId, userId = null) =>
    removeFromCart(productId, userId),
  getCartTotal: (userId = null) => getCartTotal(userId),
  getCartItemCount: (userId = null) => getCartItemCount(userId),

  saveFavorites: (favorites, userId = null) => saveFavorites(favorites, userId),
  getFavorites: (userId = null) => getFavorites(userId),
  addToFavorites: (product, userId = null) => addToFavorites(product, userId),
  removeFromFavorites: (productId, userId = null) =>
    removeFromFavorites(productId, userId),
  isFavorite: (productId, userId = null) => isFavorite(productId, userId),

  saveTheme,
  getTheme,

  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
};
