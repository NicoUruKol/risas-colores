import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "../styles/globals.css";
import AppShell from "./AppShell";

import Home from "../pages/Home";
import ElJardin from "../pages/ElJardin";
import Contacto from "../pages/Contacto";

import UniformesEntry from "../pages/UnifomesEntry";
import ProductoDetalle from "../pages/ProductosDetalle";

import Carrito from "../pages/Carrito";
import Checkout from "../pages/Checkout";
import Confirmacion from "../pages/Confirmacion";

// Admin (CRUD front preparado)
import AdminProductos from "../pages/admin/AdminProductos";
import AdminProductoForm from "../pages/admin/AdminProductoForm";

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/el-jardin", element: <ElJardin /> },
      { path: "/contacto", element: <Contacto /> },
      { path: "/admin/productos", element: <AdminProductos /> },
      { path: "/admin/productos/nuevo", element: <AdminProductoForm /> },
      { path: "/admin/productos/:id/editar", element: <AdminProductoForm /> },

      // TIENDA
      { path: "/uniformes", element: <UniformesEntry /> },
      { path: "/producto/:id", element: <ProductoDetalle /> },

      { path: "/carrito", element: <Carrito /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/confirmacion", element: <Confirmacion /> },

      // ADMIN
      { path: "/admin/productos", element: <AdminProductos /> },
      { path: "/admin/productos/nuevo", element: <AdminProductoForm /> },
      { path: "/admin/productos/:id/editar", element: <AdminProductoForm /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
