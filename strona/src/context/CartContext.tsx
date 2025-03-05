"use client";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

interface Product {
  _id: number;
  name: string;
  price: number;
  image: string;
  categories?: string[];
  description?: string;
  size?: string;
}

interface CartProduct extends Product {
  quantity: number; // Dodaj ilość
}

interface CartContextType {
  cartCount: number;
  cartProducts: CartProduct[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCartProducts((prev) => {
      const existingProduct = prev.find((p) => p._id === product._id);

      if (existingProduct) {
        return prev.map((p) =>
          p._id === existingProduct._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = (productId: number) => {
    setCartProducts((prev) =>
      prev
        .map((product) =>
          product._id === productId // Zmieniono na _id
            ? { ...product, quantity: product.quantity - 1 }
            : product
        )
        .filter((product) => product.quantity > 0)
    );
  };

  const cartCount = cartProducts.reduce(
    (count, product) => count + product.quantity,
    0
  );

  const value = useMemo(
    () => ({
      cartCount,
      cartProducts,
      addToCart,
      removeFromCart,
    }),
    [cartCount, cartProducts]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
