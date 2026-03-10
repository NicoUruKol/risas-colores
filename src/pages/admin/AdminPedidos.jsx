import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
    adminListOrders,
    adminGetOrderById,
    adminUpdateOrderStatus,
    adminUpdateOrderDeliveryStatus,
    adminCancelOrder,
} from "../../services/adminOrdersApi";

/* ==============================
Helpers
============================== */
const getDisplayPaymentStatus = (status) => {
    if (status === "created") return "pending_payment";
    return status || "pending_payment";
};

const PAYMENT_STATUS_LABELS = {
    pending_payment: "Pago pendiente",
    paid: "Pagado",
    expired: "Expirado",
    cancelled: "Cancelado",
};

const DELIVERY_STATUS_LABELS = {
    pending_delivery: "Pendiente de entrega",
    delivered: "Entregado",
};

const PAYMENT_STATUS_BADGE = {
    pending_payment: "orange",
    paid: "blue",
    expired: "lavender",
    cancelled: "lavender",
};

const DELIVERY_STATUS_BADGE = {
    pending_delivery: "orange",
    delivered: "blue",
};

const formatMoney = (n) => Number(n || 0).toLocaleString("es-AR");

const formatDate = (value) => {
    if (!value) return "—";

    try {
        if (typeof value?.toDate === "function") {
            return value.toDate().toLocaleString("es-AR");
        }

        if (value?._seconds) {
            return new Date(value._seconds * 1000).toLocaleString("es-AR");
        }

        return new Date(value).toLocaleString("es-AR");
    } catch {
        return "—";
    }
};

const getDateMs = (value) => {
    if (!value) return 0;

    try {
        if (typeof value?.toDate === "function") return value.toDate().getTime();
        if (value?._seconds) return value._seconds * 1000;
        return new Date(value).getTime() || 0;
    } catch {
        return 0;
    }
};

const getFamilyLabel = (order) => {
    const adult = order?.family?.adultName || order?.customer?.name || "Sin nombre";
    const kid = order?.family?.kidName || "Sin peque";
    return `${adult} · ${kid}`;
};

const canCancelOrder = (order) => {
    return ["created", "pending_payment", "expired"].includes(order?.status);
};

const canMarkDelivered = (order) => {
    return getDisplayPaymentStatus(order?.status) === "paid" && order?.deliveryStatus === "pending_delivery";
};

const canMarkPendingDelivery = (order) => {
    return getDisplayPaymentStatus(order?.status) === "paid" && order?.deliveryStatus === "delivered";
};

const canChangePaymentStatus = (order, nextStatus) => {
    const current = order?.status;

    if (!current || current === nextStatus) return false;
    if (current === "cancelled") return false;

    if (current === "created") {
        return ["pending_payment", "paid", "cancelled"].includes(nextStatus);
    }

    if (current === "pending_payment") {
        return ["paid", "expired", "cancelled"].includes(nextStatus);
    }

    if (current === "expired") {
        return ["cancelled"].includes(nextStatus);
    }

    return false;
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const matchesQuickFilter = (order, quickFilter) => {
    const paymentStatus = getDisplayPaymentStatus(order?.status);
    const deliveryStatus = order?.deliveryStatus;

    if (quickFilter === "pending_payment") {
        return paymentStatus === "pending_payment";
    }

    if (quickFilter === "pending_delivery") {
        return paymentStatus === "paid" && deliveryStatus === "pending_delivery";
    }

    if (quickFilter === "delivered") {
        return paymentStatus === "paid" && deliveryStatus === "delivered";
    }

    if (quickFilter === "cancelled") {
        return paymentStatus === "cancelled";
    }

    return true;
};

const getOrderPriority = (order) => {
    const paymentStatus = getDisplayPaymentStatus(order?.status);
    const deliveryStatus = order?.deliveryStatus;

    if (paymentStatus === "paid" && deliveryStatus === "pending_delivery") return 1;
    if (paymentStatus === "pending_payment") return 2;
    if (paymentStatus === "paid" && deliveryStatus === "delivered") return 3;
    if (paymentStatus === "expired") return 4;
    if (paymentStatus === "cancelled") return 5;

    return 6;
};

/* ==============================
Component
============================== */
export default function AdminPedidos() {
    /* ==============================
    State
    ============================== */
    const [orders, setOrders] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [workingId, setWorkingId] = useState("");
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [quickFilter, setQuickFilter] = useState("pending_delivery");

    /* ==============================
    Derived
    ============================== */
    const counters = useMemo(() => {
        let pendingPayment = 0;
        let pendingDelivery = 0;
        let delivered = 0;
        let cancelled = 0;

        for (const order of orders) {
            const paymentStatus = getDisplayPaymentStatus(order?.status);
            const deliveryStatus = order?.deliveryStatus;

            if (paymentStatus === "pending_payment") pendingPayment += 1;
            if (paymentStatus === "paid" && deliveryStatus === "pending_delivery") pendingDelivery += 1;
            if (paymentStatus === "paid" && deliveryStatus === "delivered") delivered += 1;
            if (paymentStatus === "cancelled") cancelled += 1;
        }

        return {
            pendingPayment,
            pendingDelivery,
            delivered,
            cancelled,
            total: orders.length,
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const q = normalizeText(search);

        const result = orders.filter((order) => {
            const matchesSearch =
                !q ||
                normalizeText(order.id).includes(q) ||
                normalizeText(order?.family?.adultName).includes(q) ||
                normalizeText(order?.family?.kidName).includes(q) ||
                normalizeText(order?.customer?.name).includes(q) ||
                normalizeText(order?.customer?.email).includes(q) ||
                normalizeText(order?.customer?.phone).includes(q);

            if (!matchesSearch) return false;

            return matchesQuickFilter(order, quickFilter);
        });

        return [...result].sort((a, b) => {
            const priorityDiff = getOrderPriority(a) - getOrderPriority(b);
            if (priorityDiff !== 0) return priorityDiff;

            return getDateMs(b?.createdAt) - getDateMs(a?.createdAt);
        });
    }, [orders, search, quickFilter]);

    /* ==============================
    Data load
    ============================== */
    const loadOrders = async ({ preserveSelected = true } = {}) => {
        setLoading(true);
        setError("");

        try {
            const data = await adminListOrders();
            setOrders(data);

            if (!preserveSelected) {
                setSelectedId("");
                setSelectedOrder(null);
                return;
            }

            if (selectedId) {
                const stillExists = data.some((order) => order.id === selectedId);
                if (!stillExists) {
                    setSelectedId("");
                    setSelectedOrder(null);
                }
            }
        } catch (err) {
            setError(err?.data?.message || err?.message || "No se pudieron cargar los pedidos.");
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetail = async (id) => {
        if (!id) {
            setSelectedId("");
            setSelectedOrder(null);
            return;
        }

        setSelectedId(id);
        setLoadingDetail(true);
        setError("");

        try {
            const data = await adminGetOrderById(id);
            setSelectedOrder(data);
        } catch (err) {
            setError(err?.data?.message || err?.message || "No se pudo cargar el detalle del pedido.");
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        loadOrders({ preserveSelected: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedId) return;

        const stillVisible = filteredOrders.some((order) => order.id === selectedId);

        if (!stillVisible) {
            setSelectedId("");
            setSelectedOrder(null);
        }
    }, [filteredOrders, selectedId]);

    /* ==============================
    Actions
    ============================== */
    const refreshAfterAction = async (idToReload) => {
        await loadOrders({ preserveSelected: true });

        if (idToReload) {
            await loadOrderDetail(idToReload);
        }
    };

    const handlePaymentStatus = async (order, nextStatus) => {
        if (!order?.id) return;
        if (!canChangePaymentStatus(order, nextStatus)) return;

        setWorkingId(order.id);
        setError("");

        try {
            await adminUpdateOrderStatus(order.id, nextStatus);
            await refreshAfterAction(order.id);
        } catch (err) {
            setError(err?.data?.message || err?.message || "No se pudo actualizar el estado de pago.");
        } finally {
            setWorkingId("");
        }
    };

    const handleDeliveryStatus = async (order, nextDeliveryStatus) => {
        if (!order?.id) return;

        setWorkingId(order.id);
        setError("");

        try {
            await adminUpdateOrderDeliveryStatus(order.id, nextDeliveryStatus);
            await refreshAfterAction(order.id);
        } catch (err) {
            setError(err?.data?.message || err?.message || "No se pudo actualizar el estado de entrega.");
        } finally {
            setWorkingId("");
        }
    };

    const handleCancel = async (order) => {
        if (!order?.id || !canCancelOrder(order)) return;

        const ok = window.confirm(
            `Vas a cancelar el pedido #${order.id}. Esta acción puede devolver stock. ¿Querés continuar?`
        );

        if (!ok) return;

        setWorkingId(order.id);
        setError("");

        try {
            await adminCancelOrder(order.id);
            await refreshAfterAction(order.id);
        } catch (err) {
            setError(err?.data?.message || err?.message || "No se pudo cancelar el pedido.");
        } finally {
            setWorkingId("");
        }
    };

    const clearFilters = () => {
        setSearch("");
        setQuickFilter("pending_delivery");
    };

    /* ==============================
    Render
    ============================== */
    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Badge variant="lavender">Admin</Badge>
                    <h2 className="text-2xl font-extrabold text-ui-text mt-2">Pedidos</h2>
                    <p className="text-sm text-ui-muted mt-2">
                        Primero ves lo importante para trabajar hoy.
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={() => loadOrders({ preserveSelected: true })}
                    disabled={loading}
                >
                    Recargar
                </Button>
            </div>

            {error ? (
                <Card className="p-4 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                </Card>
            ) : null}

            {/* ============================== */}
            {/* Dashboard */}
            {/* ============================== */}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Card
                    className={`p-4 cursor-pointer border transition ${
                        quickFilter === "pending_payment" ? "ring-2 ring-ui-primary/30" : ""
                    }`}
                    onClick={() => setQuickFilter("pending_payment")}
                >
                    <div className="text-sm text-ui-muted">Pendientes de pago</div>
                    <div className="text-2xl font-extrabold text-ui-text mt-2">
                        {counters.pendingPayment}
                    </div>
                </Card>

                <Card
                    className={`p-4 cursor-pointer border transition ${
                        quickFilter === "pending_delivery" ? "ring-2 ring-ui-primary/30" : ""
                    }`}
                    onClick={() => setQuickFilter("pending_delivery")}
                >
                    <div className="text-sm text-ui-muted">Pendientes de entrega</div>
                    <div className="text-2xl font-extrabold text-ui-text mt-2">
                        {counters.pendingDelivery}
                    </div>
                </Card>

                <Card
                    className={`p-4 cursor-pointer border transition ${
                        quickFilter === "delivered" ? "ring-2 ring-ui-primary/30" : ""
                    }`}
                    onClick={() => setQuickFilter("delivered")}
                >
                    <div className="text-sm text-ui-muted">Entregados</div>
                    <div className="text-2xl font-extrabold text-ui-text mt-2">
                        {counters.delivered}
                    </div>
                </Card>

                <Card
                    className={`p-4 cursor-pointer border transition ${
                        quickFilter === "cancelled" ? "ring-2 ring-ui-primary/30" : ""
                    }`}
                    onClick={() => setQuickFilter("cancelled")}
                >
                    <div className="text-sm text-ui-muted">Cancelados</div>
                    <div className="text-2xl font-extrabold text-ui-text mt-2">
                        {counters.cancelled}
                    </div>
                </Card>
            </div>

            {/* ============================== */}
            {/* Filters */}
            {/* ============================== */}
            <Card className="p-4 grid gap-4">
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <Input
                        label="Buscar"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Pedido, adulto, peque, email o teléfono"
                    />

                    <div className="flex items-end gap-2 flex-wrap">
                        <Button
                            variant={quickFilter === "pending_payment" ? "primary" : "ghost"}
                            onClick={() => setQuickFilter("pending_payment")}
                        >
                            Pendientes de pago
                        </Button>

                        <Button
                            variant={quickFilter === "pending_delivery" ? "primary" : "ghost"}
                            onClick={() => setQuickFilter("pending_delivery")}
                        >
                            Pendientes de entrega
                        </Button>

                        <Button
                            variant={quickFilter === "delivered" ? "primary" : "ghost"}
                            onClick={() => setQuickFilter("delivered")}
                        >
                            Entregados
                        </Button>

                        <Button
                            variant={quickFilter === "cancelled" ? "primary" : "ghost"}
                            onClick={() => setQuickFilter("cancelled")}
                        >
                            Cancelados
                        </Button>

                        <Button
                            variant={quickFilter === "all" ? "primary" : "ghost"}
                            onClick={() => setQuickFilter("all")}
                        >
                            Todos
                        </Button>

                        <Button variant="ghost" onClick={clearFilters}>
                            Limpiar
                        </Button>
                    </div>
                </div>

                <div className="text-sm text-ui-muted">
                    Mostrando <b className="text-ui-text">{filteredOrders.length}</b> de{" "}
                    <b className="text-ui-text">{orders.length}</b> pedido(s)
                </div>
            </Card>

            {loading ? (
                <Card className="p-5">
                    <p className="text-ui-muted">Cargando pedidos...</p>
                </Card>
            ) : filteredOrders.length === 0 ? (
                <Card className="p-5">
                    <p className="text-ui-muted">
                        No hay pedidos que coincidan con la vista actual.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
                    {/* ============================== */}
                    {/* Listado */}
                    {/* ============================== */}
                    <div className="grid gap-3">
                        {filteredOrders.map((order) => {
                            const isSelected = selectedId === order.id;
                            const isWorking = workingId === order.id;
                            const displayPaymentStatus = getDisplayPaymentStatus(order.status);

                            return (
                                <Card
                                    key={order.id}
                                    className={`p-4 grid gap-3 border transition ${
                                        isSelected ? "ring-2 ring-ui-primary/30" : ""
                                    }`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="grid gap-1">
                                            <div className="text-sm text-ui-muted">
                                                Pedido <b className="text-ui-text">#{order.id}</b>
                                            </div>
                                            <div className="text-sm text-ui-text font-semibold">
                                                {getFamilyLabel(order)}
                                            </div>
                                            <div className="text-xs text-ui-muted">
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xs text-ui-muted">Total</div>
                                            <div className="text-lg font-extrabold text-ui-text">
                                                ${formatMoney(order.total)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={PAYMENT_STATUS_BADGE[displayPaymentStatus] || "lavender"}>
                                            {PAYMENT_STATUS_LABELS[displayPaymentStatus] || displayPaymentStatus}
                                        </Badge>

                                        <Badge
                                            variant={
                                                DELIVERY_STATUS_BADGE[order.deliveryStatus] || "lavender"
                                            }
                                        >
                                            {DELIVERY_STATUS_LABELS[order.deliveryStatus] ||
                                                order.deliveryStatus ||
                                                "Sin estado"}
                                        </Badge>
                                    </div>

                                    <div className="text-sm text-ui-muted">
                                        {Array.isArray(order.items) ? order.items.length : 0} producto(s)
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={isSelected ? "secondary" : "ghost"}
                                            onClick={() =>
                                                isSelected
                                                    ? loadOrderDetail("")
                                                    : loadOrderDetail(order.id)
                                            }
                                            disabled={loadingDetail && isSelected}
                                        >
                                            {isSelected ? "Ocultar detalle" : "Ver detalle"}
                                        </Button>

                                        {canMarkDelivered(order) ? (
                                            <Button
                                                variant="primary"
                                                onClick={() => handleDeliveryStatus(order, "delivered")}
                                                disabled={isWorking}
                                            >
                                                Marcar entregado
                                            </Button>
                                        ) : null}

                                        {canMarkPendingDelivery(order) ? (
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    handleDeliveryStatus(order, "pending_delivery")
                                                }
                                                disabled={isWorking}
                                            >
                                                Volver a pendiente
                                            </Button>
                                        ) : null}

                                        {canCancelOrder(order) ? (
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleCancel(order)}
                                                disabled={isWorking}
                                            >
                                                Cancelar
                                            </Button>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1 border-t border-ui-border">
                                        {canChangePaymentStatus(order, "pending_payment") ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePaymentStatus(order, "pending_payment")}
                                                disabled={isWorking}
                                            >
                                                Pasar a pendiente
                                            </Button>
                                        ) : null}

                                        {canChangePaymentStatus(order, "paid") ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePaymentStatus(order, "paid")}
                                                disabled={isWorking}
                                            >
                                                Marcar pagado
                                            </Button>
                                        ) : null}

                                        {canChangePaymentStatus(order, "expired") ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePaymentStatus(order, "expired")}
                                                disabled={isWorking}
                                            >
                                                Marcar expirado
                                            </Button>
                                        ) : null}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* ============================== */}
                    {/* Detalle */}
                    {/* ============================== */}
                    <Card className="p-5 h-fit sticky top-4">
                        {!selectedId ? (
                            <div className="grid gap-2">
                                <div className="text-lg font-bold text-ui-text">
                                    Detalle del pedido
                                </div>
                                <p className="text-sm text-ui-muted">
                                    Seleccioná un pedido para ver la información completa.
                                </p>
                            </div>
                        ) : loadingDetail ? (
                            <p className="text-ui-muted">Cargando detalle...</p>
                        ) : !selectedOrder ? (
                            <p className="text-ui-muted">
                                No se pudo cargar el detalle del pedido.
                            </p>
                        ) : (
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <div className="text-xs uppercase tracking-wide text-ui-muted">
                                        Pedido
                                    </div>
                                    <div className="text-lg font-extrabold text-ui-text">
                                        #{selectedOrder.id}
                                    </div>
                                    <div className="text-sm text-ui-muted">
                                        Creado: {formatDate(selectedOrder.createdAt)}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant={
                                            PAYMENT_STATUS_BADGE[
                                                getDisplayPaymentStatus(selectedOrder.status)
                                            ] || "lavender"
                                        }
                                    >
                                        {PAYMENT_STATUS_LABELS[
                                            getDisplayPaymentStatus(selectedOrder.status)
                                        ] || getDisplayPaymentStatus(selectedOrder.status)}
                                    </Badge>

                                    <Badge
                                        variant={
                                            DELIVERY_STATUS_BADGE[selectedOrder.deliveryStatus] || "lavender"
                                        }
                                    >
                                        {DELIVERY_STATUS_LABELS[selectedOrder.deliveryStatus] ||
                                            selectedOrder.deliveryStatus}
                                    </Badge>
                                </div>

                                <div className="grid gap-2">
                                    <div className="text-sm font-bold text-ui-text">
                                        Datos de la familia
                                    </div>
                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Adulto:</b>{" "}
                                        {selectedOrder?.family?.adultName ||
                                            selectedOrder?.customer?.name ||
                                            "—"}
                                    </div>
                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Peque:</b>{" "}
                                        {selectedOrder?.family?.kidName || "—"}
                                    </div>
                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Email:</b>{" "}
                                        {selectedOrder?.customer?.email || "—"}
                                    </div>
                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Teléfono:</b>{" "}
                                        {selectedOrder?.customer?.phone || "—"}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <div className="text-sm font-bold text-ui-text">
                                        Productos
                                    </div>

                                    {Array.isArray(selectedOrder.items) &&
                                    selectedOrder.items.length > 0 ? (
                                        <div className="grid gap-2">
                                            {selectedOrder.items.map((item, index) => (
                                                <div
                                                    key={`${item.code}-${item.size}-${index}`}
                                                    className="rounded-2xl border border-ui-border p-3 grid gap-1"
                                                >
                                                    <div className="font-semibold text-ui-text">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-sm text-ui-muted">
                                                        Código: {item.code}
                                                    </div>
                                                    <div className="text-sm text-ui-muted">
                                                        Talle: <b className="text-ui-text">{item.size}</b>
                                                    </div>
                                                    <div className="text-sm text-ui-muted">
                                                        Cantidad: <b className="text-ui-text">{item.qty}</b>
                                                    </div>
                                                    <div className="text-sm text-ui-muted">
                                                        Unitario: $
                                                        <b className="text-ui-text">
                                                            {formatMoney(item.unitPrice)}
                                                        </b>
                                                    </div>
                                                    <div className="text-sm text-ui-muted">
                                                        Subtotal: $
                                                        <b className="text-ui-text">
                                                            {formatMoney(item.lineTotal)}
                                                        </b>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-ui-muted">
                                            Este pedido no tiene items visibles.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-ui-border grid gap-1">
                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Total:</b> $
                                        {formatMoney(selectedOrder.total)}
                                    </div>

                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Preference ID:</b>{" "}
                                        {selectedOrder?.mp?.preferenceId || "—"}
                                    </div>

                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Payment ID:</b>{" "}
                                        {selectedOrder?.mp?.paymentId || "—"}
                                    </div>

                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Estado MP:</b>{" "}
                                        {selectedOrder?.mp?.status || "—"}
                                    </div>

                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Webhook:</b>{" "}
                                        {formatDate(selectedOrder?.mp?.lastWebhookAt)}
                                    </div>

                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Pago acreditado:</b>{" "}
                                        {formatDate(selectedOrder?.mp?.paidAt)}
                                    </div>

                                    <div className="text-sm text-ui-muted">
                                        <b className="text-ui-text">Entregado:</b>{" "}
                                        {formatDate(selectedOrder?.deliveredAt)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}