import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ImageBox from "../../components/ui/ImageBox";
import { adminDelete, adminList } from "../../services/productsApi";

const formatTalles = (talles = []) => {
    if (!Array.isArray(talles) || talles.length === 0) return "-";
    if (talles.includes("Único")) return "Único";
    return talles.join(" · ");
    };

    export default function AdminProductos() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        adminList().then((res) => {
        setItems(res);
        setLoading(false);
        });
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id) => {
        // acá podés enchufar tu SweetAlert confirmar si querés
        await adminDelete(id);
        load();
    };

    return (
        <main className="py-10">
        <Container className="grid gap-6">
            <div className="flex items-start justify-between gap-4">
            <div>
                <Badge variant="lavender">Admin</Badge>
                <h1 className="text-2xl font-extrabold text-ui-text mt-2">Productos</h1>
                <p className="text-sm text-ui-muted mt-2">
                Gestioná Remera, Pantalón, Buzo y Mochila. Cada producto define sus talles disponibles.
                </p>
            </div>

            <Link to="/admin/productos/nuevo">
                <Button variant="primary">Nuevo producto</Button>
            </Link>
            </div>

            {loading ? (
            <Card className="p-5">
                <p className="text-ui-muted">Cargando…</p>
            </Card>
            ) : items.length === 0 ? (
            <Card className="p-5">
                <p className="text-ui-muted">No hay productos cargados.</p>
            </Card>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                <Card key={p.id} className="p-4">
                    <ImageBox src={p.image} alt={p.name} />
                    <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                        <div className="font-bold text-ui-text">{p.name}</div>
                        <div className="text-xs text-ui-muted mt-1">
                        Talles: {formatTalles(p.talles)}
                        </div>
                        <div className="text-xs text-ui-muted mt-1">
                        Stock: {Number.isFinite(Number(p.stock)) ? Number(p.stock) : "-"}
                        {" · "}
                        Estado: {p.active === false ? "Inactivo" : "Activo"}
                        </div>
                    </div>
                    <div className="font-extrabold text-brand-orange">
                        ${Number(p.price || 0).toLocaleString("es-AR")}
                    </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link to={`/admin/productos/${p.id}/editar`}>
                        <Button variant="secondary" className="w-full">Editar</Button>
                    </Link>
                    <Button variant="ghost" className="w-full" onClick={() => handleDelete(p.id)}>
                        Eliminar
                    </Button>
                    </div>
                </Card>
                ))}
            </div>
            )}
        </Container>
        </main>
    );
}