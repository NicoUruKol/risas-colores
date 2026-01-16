import { Link } from "react-router-dom";
import Container from "./Container";

export default function Footer() {
    return (
        <footer className="bg-ui-surface border-t border-ui-border">
        <Container className="py-6 text-sm text-ui-muted grid gap-2">
            <div className="font-semibold text-ui-text">
            Jardín Maternal Risas y Colores
            </div>

            <div>
            <span>Dirección · </span>
            <a href="https://wa.me/549XXXXXXXXXX" target="_blank" rel="noreferrer">
                WhatsApp
            </a>
            <span> · Teléfono</span>
            </div>

            <div className="flex flex-wrap gap-3">
            <Link to="/el-jardin">El Jardín</Link>
            <Link to="/uniformes">Uniformes</Link>
            <Link to="/carrito">Carrito</Link>

            <a href="https://instagram.com/risasycolores.jardinmaternal?igsh=dXFqeGdseGoyM3F4" target="_blank" rel="noreferrer">
                Instagram
            </a>
            </div>
        </Container>
        </footer>
    );
}

