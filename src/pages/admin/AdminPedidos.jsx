import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function AdminPedidos() {
    return (
        <div className="grid gap-4">
        <div>
            <Badge variant="lavender">Admin</Badge>
            <h2 className="text-2xl font-extrabold text-ui-text mt-2">Pedidos</h2>
            <p className="text-sm text-ui-muted mt-2">Pantalla futura.</p>
        </div>

        <Card className="p-5">
            <p className="text-ui-muted">Todavía no implementado.</p>
        </Card>
        </div>
    );
}
