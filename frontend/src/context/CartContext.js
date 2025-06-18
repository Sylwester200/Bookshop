import { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (book) => {
    setCart(prev => [...prev, book]);
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const i = prev.findIndex(item => item.id === id);
      if (i === -1) return prev;
      const copy = [...prev];
      copy.splice(i, 1);
      return copy;
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
