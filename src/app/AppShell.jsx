import { useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BackgroundDecor2 from "../components/layout/BackgroundDecor2";
import MobileDecor from "../components/layout/MobileDecor";
import { CartProvider } from "../context/CartContext";

function useIsMobile() {
  // ✅ 1 sola vez, sin re-render
    return useMemo(() => {
        if (typeof window === "undefined") return false;
        const mq = window.matchMedia?.("(max-width: 768px)").matches;
        const ua =
        typeof navigator !== "undefined" &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        return Boolean(mq || ua);
    }, []);
}

export default function AppShell() {
    const pageRef = useRef(null);
    const { pathname } = useLocation();

    // Solo en Home
    const isHome = pathname === "/";

    // Decor: gusanos solo desktop / blobs solo mobile
    const isMobile = useIsMobile();
    const showWorms = isHome && !isMobile;
    const showMobileDecor = isHome && isMobile;

    return (
        <CartProvider>
        <div ref={pageRef} className="relative min-h-screen overflow-x-hidden">
            {/* Fondo decorativo */}
            {showWorms && (
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                {/* si tu BackgroundDecor2 usa containerRef para height real */}
                <BackgroundDecor2 containerRef={pageRef} />
            </div>
            )}

            {showMobileDecor && (
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <MobileDecor />
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
