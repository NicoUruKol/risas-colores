import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function AdminContenido() {
    return (
        <div className="grid gap-4">
        <div className="flex items-start justify-between gap-4">
            <div>
            <Badge variant="lavender">Admin</Badge>
            <h2 className="text-2xl font-extrabold text-ui-text mt-2">Contenido</h2>
            <p className="text-sm text-ui-muted mt-2">
                Hero (imágenes + título/subtítulo) y Galería de “El Jardín”.
            </p>
            </div>
        </div>

        <Card className="p-5 grid gap-3">
            <div className="font-extrabold text-ui-text">Hero</div>
            <p className="text-sm text-ui-muted">
            Acá vamos a listar imágenes de Cloudinary (folder Hero), seleccionar/ordenar, y guardar en Firestore.
            </p>
            <Button variant="secondary" disabled>Configurar Hero (próximo)</Button>
        </Card>

        <Card className="p-5 grid gap-3">
            <div className="font-extrabold text-ui-text">Galería “El Jardín”</div>
            <p className="text-sm text-ui-muted">
            Acá vamos a listar imágenes de Cloudinary (folder gallery), seleccionar/ordenar, y guardar en Firestore.
            </p>
            <Button variant="secondary" disabled>Configurar Galería (próximo)</Button>
        </Card>
        </div>
    );
}
