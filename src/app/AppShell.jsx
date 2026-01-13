import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BackgroundDecor2 from "../components/layout/BackgroundDecor2";

import { CartProvider } from "../context/CartContext";

export default function AppShell() {
    const pageRef = useRef(null);
    const { pathname } = useLocation();

    // Solo en Home
    const showDecor = pathname === "/";

    return (
        <CartProvider>
        <div ref={pageRef} className="relative min-h-screen overflow-hidden">
            {showDecor && (
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <BackgroundDecor2 containerRef={pageRef} />
            </div>
            )}

            <Header />
            <main className="relative z-10">
            <Outlet />
            </main>
            <Footer />
        </div>
        </CartProvider>
    );
}
