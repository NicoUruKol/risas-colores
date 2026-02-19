import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function AdminContenido() {
    return (
        <div className="grid gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
            <div>
            <Badge variant="lavender">Admin</Badge>
            <h2 className="text-2xl font-extrabold text-ui-text mt-2">
                Contenido
            </h2>
            <p className="text-sm text-ui-muted mt-2">
                Hero (imágenes + título/subtítulo) y Galería de “El Jardín”.
            </p>
            </div>
        </div>

        {/* Hero */}
        <Card className="p-5 grid gap-3">
            <div className="font-extrabold text-ui-text">Hero</div>
            <p className="text-sm text-ui-muted">
            Configuración del carrusel principal (imágenes, título y subtítulo).
            </p>

            <Link to="/admin/contenido/hero">
            <Button variant="ghost">
                Configurar Hero
            </Button>
            </Link>
        </Card>

        {/* Galería */}
        <Card className="p-5 grid gap-3">
            <div className="font-extrabold text-ui-text">
            Galería “El Jardín”
            </div>
            <p className="text-sm text-ui-muted">
            Seleccionar, ordenar y guardar imágenes desde Cloudinary (folder gallery).
            </p>

            <Link to="/admin/contenido/galeria">
            <Button variant="ghost">
                Configurar Galería
            </Button>
            </Link>
        </Card>
        </div>
    );
}
