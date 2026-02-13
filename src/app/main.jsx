import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import "../styles/globals.css";
import AppShell from "./AppShell";

import Home from "../pages/Home";
import ElJardin from "../pages/ElJardin";
import UniformesEntry from "../pages/UnifomesEntry";
import ProductoDetalle from "../pages/ProductosDetalle";
import Carrito from "../pages/Carrito";
import Checkout from "../pages/Checkout";
import Confirmacion from "../pages/Confirmacion";

import AdminLayout from "../pages/admin/AdminLayout";
import AdminProductos from "../pages/admin/AdminProductos";
import AdminProductoForm from "../pages/admin/AdminProductoForm";
import AdminContenido from "../pages/admin/AdminContenido";
import AdminPedidos from "../pages/admin/AdminPedidos";
import AdminLogin from "../pages/admin/AdminLogin";

import AdminProtected from "./components/auth/AdminProtected";
import { AdminAuthProvider } from "../context/AdminAuthContext";


const routes = [
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/el-jardin", element: <ElJardin /> },

      { path: "/uniformes", element: <UniformesEntry /> },
      { path: "/producto/:id", element: <ProductoDetalle /> },

      { path: "/carrito", element: <Carrito /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/confirmacion", element: <Confirmacion /> },

      // ✅ Login admin (público)
      { path: "/admin/login", element: <AdminLogin /> },

      // ✅ Todo /admin protegido
      {
        path: "/admin",
        element: (
          <AdminProtected>
            <AdminLayout />
          </AdminProtected>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/productos" replace /> },

          { path: "productos", element: <AdminProductos /> },
          { path: "productos/nuevo", element: <AdminProductoForm /> },
          { path: "productos/:id/editar", element: <AdminProductoForm /> },

          { path: "contenido", element: <AdminContenido /> },
          { path: "pedidos", element: <AdminPedidos /> },
        ],
      },

      { path: "*", element: <Home /> },
    ],
  },
];

const routerType = import.meta.env.VITE_ROUTER; // "hash" o "browser"

const router =
  routerType === "hash"
    ? createHashRouter(routes)
    : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <RouterProvider router={router} />
    </AdminAuthProvider>
  </React.StrictMode>
);
