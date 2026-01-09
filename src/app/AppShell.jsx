import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { CartProvider } from "../context/CartContext";
import BackgroundDecor from "../components/layout/BackgroundDecor";

export default function AppShell() {
    return (
        <CartProvider>
            <BackgroundDecor />
            <Header />
            <Outlet />
            <Footer />
        </CartProvider>
    );
}
