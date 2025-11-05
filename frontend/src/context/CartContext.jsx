import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  saveCart,
  addToCart as addToCartLS,
  updateCartItemQty as updateCartLS,
  removeFromCart as removeFromCartLS,
  clearCart as clearCartLS,
  getCartTotal as getCartTotalLS,
  getCartItemCount as getCartCountLS,
} from "../utils/localStorage";

const CartContext = createContext();

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const userId = user?.id || null;
    const storedCart = getCart(userId);
    setCartItems(storedCart);
  }, [user]);

  const addToCart = (product, qty = 1) => {

    if (product.countInStock < qty) {
      throw new Error(`Chỉ còn ${product.countInStock} sản phẩm trong kho`);
    }

    const userId = user?.id || null;

    const updatedCart = addToCartLS(product, qty, userId);

    setCartItems(updatedCart);

    return updatedCart;
  };

  const updateCartItemQty = (productId, qty) => {

    const item = cartItems.find((i) => i.product.id === productId);

    if (!item) {
      throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    if (qty > 0 && item.product.countInStock < qty) {
      throw new Error(
        `Chỉ còn ${item.product.countInStock} sản phẩm trong kho`
      );
    }

    const userId = user?.id || null;

    const updatedCart = updateCartLS(productId, qty, userId);

    setCartItems(updatedCart);

    return updatedCart;
  };

  const removeFromCart = (productId) => {

    const userId = user?.id || null;

    const updatedCart = removeFromCartLS(productId, userId);

    setCartItems(updatedCart);

    return updatedCart;
  };

  const clearCart = () => {

    const userId = user?.id || null;

    clearCartLS(userId);

    setCartItems([]);
  };

  const getCartTotal = () => {
    const userId = user?.id || null;
    return getCartTotalLS(userId);
  };

  const getCartItemCount = () => {
    const userId = user?.id || null;
    return getCartCountLS(userId);
  };

  const isInCart = (productId) => {
    return cartItems.some((item) => item.product.id === productId);
  };

  const getCartItem = (productId) => {
    return cartItems.find((item) => item.product.id === productId) || null;
  };

  const value = {

    cartItems, // Mảng cart items

    addToCart, // Thêm vào cart
    updateCartItemQty, // Cập nhật số lượng
    removeFromCart, // Xóa khỏi cart
    clearCart, // Xóa toàn bộ cart
    getCartTotal, // Tính tổng giá trị
    getCartItemCount, // Đếm số items
    isInCart, // Check có trong cart không
    getCartItem, // Lấy thông tin item
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

export default CartContext;
