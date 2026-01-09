import Container from "./Container";

export default function Footer() {
    return (
        <footer className="bg-ui-surface border-t border-ui-border">
            <Container className="py-6 text-sm text-ui-muted grid gap-1">
                <div className="font-semibold text-ui-text">Jardín Maternal Risas y Colores</div>
                <div>Dirección · Teléfono · WhatsApp</div>
                <div>Horarios · Redes</div>
            </Container>
        </footer>
    );
}
