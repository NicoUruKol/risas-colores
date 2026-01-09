import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Confirmacion() {
    return (
        <main className="py-10">
            <Container className="max-w-[760px]">
                <Card className="p-8 text-center grid gap-3">
                    <div className="text-4xl">🎉</div>
                    <h1 className="text-2xl font-extrabold text-ui-text">¡Compra realizada!</h1>
                    <p className="text-ui-muted">
                        Gracias por confiar en el jardín 💛 Te enviaremos un email con los detalles.
                    </p>
                    <div className="mt-2 flex justify-center gap-3">
                        <Link to="/"><Button variant="secondary">Volver al inicio</Button></Link>
                        <Link to="/uniformes"><Button variant="primary">Comprar más</Button></Link>
                    </div>
                </Card>
            </Container>
        </main>
    );
}
