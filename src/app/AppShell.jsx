import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/layout/Footer";
import BackgroundDecor2 from "../components/layout/BackgroundDecor2";
import MobileDecor from "../components/layout/MobileDecor";
import { CartProvider } from "../context/CartContext";
import ScrollToTop from "../routes/ScrollToTop";
import Header3 from "../components/layout/Header3";
import CookieBanner, {
    CONSENT_KEY,
    CONSENT_ACCEPTED,
    } from "../components/cookies/cookieBanner";
import ConsentScripts from "../components/cookies/ConsentScripts";

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
    const [allowAnalytics, setAllowAnalytics] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const syncConsent = () => {
        const consent = localStorage.getItem(CONSENT_KEY);
        setAllowAnalytics(consent === CONSENT_ACCEPTED);
        };

        syncConsent();
        window.addEventListener("cookie-consent-changed", syncConsent);

        return () => {
        window.removeEventListener("cookie-consent-changed", syncConsent);
        };
    }, []);

    const showDecor = pathname === "/";
    //const mobile = isMobile();

    return (
        <CartProvider>
            <div ref={pageRef} className="relative min-h-screen overflow-x-hidden">
                {showDecor && (
                <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                    {/*{mobile ? <MobileDecor /> : <BackgroundDecor2 />}*/}
                    {<MobileDecor />}
                </div>
                )}

                <div className="relative z-10">
                    <ScrollToTop />
                    <Header3 />

                    <main>
                        <Outlet />
                    </main>

                    <Footer />
                </div>

                <CookieBanner />
                {allowAnalytics && <ConsentScripts />}
            </div>
        </CartProvider>
    );
}