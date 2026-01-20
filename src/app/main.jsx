import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "../styles/globals.css";
import AppShell from "./AppShell";
import Home from "../pages/Home";
import ElJardin from "../pages/ElJardin";
import UniformesEntry from "../pages/UnifomesEntry";
import Catalogo from "../pages/Catalogo";
import ProductoDetalle from "../pages/ProductosDetalle";
import Carrito from "../pages/Carrito";
import Checkout from "../pages/Checkout";
import Confirmacion from "../pages/Confirmacion";
import Contacto from "../pages/Contacto";

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/el-jardin", element: <ElJardin /> },
      { path: "/contacto", element: <Contacto /> }, // ✅ NUEVO
      { path: "/uniformes", element: <UniformesEntry /> },
      { path: "/uniformes/:sala", element: <Catalogo /> },
      { path: "/producto/:id", element: <ProductoDetalle /> },
      { path: "/carrito", element: <Carrito /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/confirmacion", element: <Confirmacion /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
