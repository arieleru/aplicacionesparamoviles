import React, { createContext, useState } from 'react';

// Creamos el contexto (La "nube" de datos)
export const CartContext = createContext();

// Creamos el Proveedor
export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  // Funcion para agregar o sumar si ya existe
  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find((item) => item.id === producto.id);
      if (existe) {
        return carritoActual.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...carritoActual, { ...producto, cantidad: 1 }];
    });
  };

  // Funcion para cambiar cantidad (+ o -) y eliminar si llega a 0
  const cambiarCantidad = (id, accion) => {
    setCarrito((carritoActual) => {
      return carritoActual
        .map((item) => {
          if (item.id === id) {
            if (accion === 'sumar') return { ...item, cantidad: item.cantidad + 1 };
            if (accion === 'restar') return { ...item, cantidad: item.cantidad - 1 };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0);
    });
  };

  // Funcion para eliminar por completo
  const eliminarDelCarrito = (id) => {
    setCarrito((carritoActual) => carritoActual.filter((item) => item.id !== id));
  };

  // Funcion para vaciar todo el carrito
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CartContext.Provider value={{ carrito, agregarAlCarrito, cambiarCantidad, eliminarDelCarrito, vaciarCarrito }}>
      {children}
    </CartContext.Provider>
  );
};
