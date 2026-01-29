import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
//import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BackgroundDecor2 from "../components/layout/BackgroundDecor2"; 
import MobileDecor from "../components/layout/MobileDecor";          
import { CartProvider } from "../context/CartContext";
import ScrollToTop from "../routes/ScrollToTop";
//import Header2 from "../components/layout/Header2";
import Header3 from "../components/layout/Header3";


function isMobile() {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia?.("(max-width: 560px)").matches ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
    }

    export default function AppShell() {
    const pageRef = useRef(null);
    const { pathname } = useLocation();

    const showDecor = pathname === "/";
    const mobile = isMobile();

    return (
        <CartProvider>
            <div ref={pageRef} className="relative min-h-screen overflow-x-hidden">
                {/* DECOR SIEMPRE ATRAS */}
                {showDecor && (
                <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                    {mobile ? <MobileDecor /> : <BackgroundDecor2 />}
                </div>
                )}

                {/* CONTENIDO ARRIBA */}
                <div className="relative z-10">
                <ScrollToTop/>
                {/*<Header />
                <Header2/>*/}
                <Header3/>
                <main>
                    <Outlet />
                </main>
                <Footer />
                </div>
            </div>
        </CartProvider>
    );
}
