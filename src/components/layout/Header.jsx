import { Link, NavLink } from "react-router-dom";
import Container from "./Container";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";

export default function Header() {
    const { count } = useCart();

    const navLinkClass = ({ isActive }) =>
        `text-sm font-semibold transition ${
        isActive ? "text-brand-blue" : "text-ui-text hover:text-brand-blue"
        }`;

    return (
        <header className="bg-ui-surface border-b border-ui-border sticky top-0 z-20">
            <Container className="h-16 flex items-center justify-between">
                <Link to="/" className="font-extrabold text-ui-text">
                    <span className="text-brand-blue">Risas</span> y{" "}
                    <span className="text-brand-orange">Colores</span>
                </Link>

                <nav className="hidden md:flex items-center gap-4">
                    <NavLink to="/el-jardin" className={navLinkClass}>
                        El Jardín
                    </NavLink>
                    <NavLink to="/uniformes" className={navLinkClass}>
                        Uniformes
                    </NavLink>
                </nav>

                <div className="flex items-center gap-3">
                    <Link to="/uniformes" className="hidden sm:block">
                        <Button variant="primary" size="sm">
                        Comprar
                        </Button>
                    </Link>

                    <Link to="/carrito" className="text-sm font-semibold text-ui-text hover:text-brand-blue transition">
                        🛒 <span className="text-ui-muted">({count})</span>
                    </Link>
                </div>
            </Container>
        </header>
    );
}
