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
    adminMarkOrderReadyForPickup,
    adminCancelOrder,
} from "../../services/adminOrdersApi";
import styles from "./AdminPedidos.module.css";

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
    ready_for_pickup: "Listo para retirar",
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
    ready_for_pickup: "lavender",
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
    return (
        getDisplayPaymentStatus(order?.status) === "paid" &&
        order?.deliveryStatus === "ready_for_pickup"
    );
};

const canMarkPendingDelivery = (order) => {
    return (
        getDisplayPaymentStatus(order?.status) === "paid" &&
        (order?.deliveryStatus === "delivered" ||
            order?.deliveryStatus === "ready_for_pickup")
    );
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

    if (quickFilter === "ready_for_pickup") {
        return paymentStatus === "paid" && deliveryStatus === "ready_for_pickup";
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
    if (paymentStatus === "paid" && deliveryStatus === "ready_for_pickup") return 2;
    if (paymentStatus === "pending_payment") return 3;
    if (paymentStatus === "paid" && deliveryStatus === "delivered") return 4;
    if (paymentStatus === "expired") return 5;
    if (paymentStatus === "cancelled") return 6;

    return 7;
};

const getPaymentActionCopy = (nextStatus) => {
    if (nextStatus === "pending_payment") {
        return {
            title: "¿Pasar a pago pendiente?",
            message: "Vas a mover manualmente el pedido a estado de pago pendiente.",
            confirmLabel: "Sí, pasar a pendiente",
        };
    }

    if (nextStatus === "paid") {
        return {
            title: "¿Marcar como pagado?",
            message: "Vas a marcar manualmente el pedido como pagado.",
            confirmLabel: "Sí, marcar pagado",
        };
    }

    if (nextStatus === "expired") {
        return {
            title: "¿Marcar como expirado?",
            message: "Vas a marcar manualmente el pedido como expirado.",
            confirmLabel: "Sí, marcar expirado",
        };
    }

    if (nextStatus === "cancelled") {
        return {
            title: "¿Cancelar pedido?",
            message: "Vas a cancelar manualmente el pedido.",
            confirmLabel: "Sí, cancelar",
        };
    }

    return {
        title: "¿Confirmar cambio?",
        message: "Se va a actualizar el estado del pedido.",
        confirmLabel: "Confirmar",
    };
};

/* ==============================
Detail view
============================== */
function OrderDetailContent({ order }) {
    if (!order) return null;

    return (
        <div className={styles.detailContent}>
            <div className={styles.detailHead}>
                <div className={styles.detailOverline}>Pedido</div>
                <div className={styles.detailOrderId}>#{order.id}</div>
                <div className={styles.detailMuted}>
                    Creado: {formatDate(order.createdAt)}
                </div>
            </div>

            <div className={styles.badgesRow}>
                <Badge
                    variant={
                        PAYMENT_STATUS_BADGE[getDisplayPaymentStatus(order.status)] || "lavender"
                    }
                >
                    {PAYMENT_STATUS_LABELS[getDisplayPaymentStatus(order.status)] ||
                        getDisplayPaymentStatus(order.status)}
                </Badge>

                <Badge variant={DELIVERY_STATUS_BADGE[order.deliveryStatus] || "lavender"}>
                    {DELIVERY_STATUS_LABELS[order.deliveryStatus] ||
                        order.deliveryStatus ||
                        "Sin estado"}
                </Badge>
            </div>

            <div className={styles.detailBlock}>
                <div className={styles.blockTitle}>Datos de la familia</div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Adulto:</b>{" "}
                    {order?.family?.adultName || order?.customer?.name || "—"}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Peque:</b> {order?.family?.kidName || "—"}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Email:</b> {order?.customer?.email || "—"}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Teléfono:</b> {order?.customer?.phone || "—"}
                </div>
            </div>

            <div className={styles.detailBlock}>
                <div className={styles.blockTitle}>Productos</div>

                {Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className={styles.itemsList}>
                        {order.items.map((item, index) => (
                            <div
                                key={`${item.code}-${item.size}-${index}`}
                                className={styles.itemCard}
                            >
                                <div className={styles.itemName}>{item.name}</div>
                                <div className={styles.detailMuted}>Código: {item.code}</div>
                                <div className={styles.detailMuted}>
                                    Talle: <b className={styles.strongText}>{item.size}</b>
                                </div>
                                <div className={styles.detailMuted}>
                                    Cantidad: <b className={styles.strongText}>{item.qty}</b>
                                </div>
                                <div className={styles.detailMuted}>
                                    Unitario: $
                                    <b className={styles.strongText}>
                                        {formatMoney(item.unitPrice)}
                                    </b>
                                </div>
                                <div className={styles.detailMuted}>
                                    Subtotal: $
                                    <b className={styles.strongText}>
                                        {formatMoney(item.lineTotal)}
                                    </b>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.detailMuted}>Este pedido no tiene items visibles.</p>
                )}
            </div>

            <div className={styles.detailSummary}>
                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Total:</b> ${formatMoney(order.total)}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Preference ID:</b>{" "}
                    {order?.mp?.preferenceId || "—"}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Payment ID:</b> {order?.mp?.paymentId || "—"}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Estado MP:</b> {order?.mp?.status || "—"}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Webhook:</b>{" "}
                    {formatDate(order?.mp?.lastWebhookAt)}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Pago acreditado:</b>{" "}
                    {formatDate(order?.mp?.paidAt)}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Listo para retirar:</b>{" "}
                    {formatDate(order?.readyForPickupAt)}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Mail listo para retirar:</b>{" "}
                    {order?.notifications?.readyForPickupEmailSent ? "Enviado" : "No enviado"}
                </div>

                <div className={styles.detailMuted}>
                    <b className={styles.strongText}>Entregado:</b>{" "}
                    {formatDate(order?.deliveredAt)}
                </div>
            </div>
        </div>
    );
}

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

    const [confirmState, setConfirmState] = useState(null);

    /* ==============================
    Derived
    ============================== */
    const counters = useMemo(() => {
        let pendingPayment = 0;
        let pendingDelivery = 0;
        let readyForPickup = 0;
        let delivered = 0;
        let cancelled = 0;

        for (const order of orders) {
            const paymentStatus = getDisplayPaymentStatus(order?.status);
            const deliveryStatus = order?.deliveryStatus;

            if (paymentStatus === "pending_payment") pendingPayment += 1;
            if (paymentStatus === "paid" && deliveryStatus === "pending_delivery") pendingDelivery += 1;
            if (paymentStatus === "paid" && deliveryStatus === "ready_for_pickup") readyForPickup += 1;
            if (paymentStatus === "paid" && deliveryStatus === "delivered") delivered += 1;
            if (paymentStatus === "cancelled") cancelled += 1;
        }

        return {
            pendingPayment,
            pendingDelivery,
            readyForPickup,
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

    const handleReadyForPickup = async (order) => {
        if (!order?.id) return;

        setWorkingId(order.id);
        setError("");

        try {
            await adminMarkOrderReadyForPickup(order.id);
            await refreshAfterAction(order.id);
        } catch (err) {
            setError(err?.data?.message || err?.message || "No se pudo marcar como listo para retirar.");
        } finally {
            setWorkingId("");
        }
    };

    const handleCancel = async (order) => {
        if (!order?.id || !canCancelOrder(order)) return;

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

    const openConfirm = (config) => {
        setConfirmState(config);
    };

    const closeConfirm = () => {
        if (workingId) return;
        setConfirmState(null);
    };

    const onConfirmAction = async () => {
        if (!confirmState?.order) return;

        const { order, kind, nextStatus, nextDeliveryStatus } = confirmState;

        try {
            if (kind === "cancel") {
                await handleCancel(order);
            }

            if (kind === "ready_for_pickup") {
                await handleReadyForPickup(order);
            }

            if (kind === "delivery_status") {
                await handleDeliveryStatus(order, nextDeliveryStatus);
            }

            if (kind === "payment_status") {
                await handlePaymentStatus(order, nextStatus);
            }
        } finally {
            setConfirmState(null);
        }
    };

    const askCancelOrder = (order) => {
        openConfirm({
            kind: "cancel",
            order,
            title: `¿Cancelar pedido #${order.id}?`,
            message: "Esta acción puede devolver stock y dejar el pedido como cancelado.",
            confirmLabel: "Sí, cancelar",
            tone: "danger",
        });
    };

    const askReadyForPickup = (order) => {
        openConfirm({
            kind: "ready_for_pickup",
            order,
            title: `¿Marcar pedido #${order.id} como listo para retirar?`,
            message: "Además de cambiar el estado, se puede disparar el aviso correspondiente.",
            confirmLabel: "Sí, marcar listo",
            tone: "primary",
        });
    };

    const askDeliveryStatus = (order, nextDeliveryStatus) => {
        if (nextDeliveryStatus === "delivered") {
            openConfirm({
                kind: "delivery_status",
                order,
                nextDeliveryStatus,
                title: `¿Marcar pedido #${order.id} como entregado?`,
                message: "Se va a registrar el pedido como entregado.",
                confirmLabel: "Sí, marcar entregado",
                tone: "primary",
            });
            return;
        }

        if (nextDeliveryStatus === "pending_delivery") {
            openConfirm({
                kind: "delivery_status",
                order,
                nextDeliveryStatus,
                title: `¿Volver pedido #${order.id} a pendiente de entrega?`,
                message: "Se va a revertir el estado de entrega actual.",
                confirmLabel: "Sí, volver a pendiente",
                tone: "secondary",
            });
        }
    };

    const askPaymentStatus = (order, nextStatus) => {
        const copy = getPaymentActionCopy(nextStatus);

        openConfirm({
            kind: "payment_status",
            order,
            nextStatus,
            title: `${copy.title} #${order.id}?`,
            message: copy.message,
            confirmLabel: copy.confirmLabel,
            tone: nextStatus === "expired" ? "secondary" : "primary",
        });
    };

    const clearFilters = () => {
        setSearch("");
        setQuickFilter("pending_delivery");
    };

    const closeMobileDetail = () => {
        setSelectedId("");
        setSelectedOrder(null);
    };

    /* ==============================
    Render flags
    ============================== */
    const showMobileList = !selectedId;
    const showMobileDetail = Boolean(selectedId);

    /* ==============================
    Render
    ============================== */
    return (
        <section className={styles.page}>
            <header className={styles.head}>
                <div className={styles.headInfo}>
                    <div className={styles.badgeWrap}>
                        <Badge variant="lavender">Admin</Badge>
                    </div>

                    <h2 className={styles.title}>Pedidos</h2>
                    <p className={styles.sub}>Primero ves lo importante para trabajar hoy.</p>
                </div>

                <Button
                    variant="secondary"
                    onClick={() => loadOrders({ preserveSelected: true })}
                    disabled={loading}
                    className={styles.reloadBtn}
                >
                    Recargar
                </Button>
            </header>

            {error ? (
                <Card className={styles.errorCard}>
                    <p className={styles.errorText}>{error}</p>
                </Card>
            ) : null}

            <div className={styles.mobileOnly}>
                {showMobileList ? (
                    <>
                        <div className={styles.dashboard}>
                            <Card
                                className={`${styles.metricCard} ${
                                    quickFilter === "pending_payment" ? styles.metricCardActive : ""
                                }`}
                                onClick={() => setQuickFilter("pending_payment")}
                            >
                                <div className={styles.metricLabel}>Pendientes de pago</div>
                                <div className={styles.metricValue}>{counters.pendingPayment}</div>
                            </Card>

                            <Card
                                className={`${styles.metricCard} ${
                                    quickFilter === "pending_delivery" ? styles.metricCardActive : ""
                                }`}
                                onClick={() => setQuickFilter("pending_delivery")}
                            >
                                <div className={styles.metricLabel}>Pendientes de entrega</div>
                                <div className={styles.metricValue}>{counters.pendingDelivery}</div>
                            </Card>

                            <Card
                                className={`${styles.metricCard} ${
                                    quickFilter === "ready_for_pickup" ? styles.metricCardActive : ""
                                }`}
                                onClick={() => setQuickFilter("ready_for_pickup")}
                            >
                                <div className={styles.metricLabel}>Listos para retirar</div>
                                <div className={styles.metricValue}>{counters.readyForPickup}</div>
                            </Card>

                            <Card
                                className={`${styles.metricCard} ${
                                    quickFilter === "delivered" ? styles.metricCardActive : ""
                                }`}
                                onClick={() => setQuickFilter("delivered")}
                            >
                                <div className={styles.metricLabel}>Entregados</div>
                                <div className={styles.metricValue}>{counters.delivered}</div>
                            </Card>

                            <Card
                                className={`${styles.metricCard} ${
                                    quickFilter === "cancelled" ? styles.metricCardActive : ""
                                }`}
                                onClick={() => setQuickFilter("cancelled")}
                            >
                                <div className={styles.metricLabel}>Cancelados</div>
                                <div className={styles.metricValue}>{counters.cancelled}</div>
                            </Card>
                        </div>

                        <Card className={styles.filtersCard}>
                            <div className={styles.filtersGrid}>
                                <div className={styles.filterButtons}>
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
                                        variant={quickFilter === "ready_for_pickup" ? "primary" : "ghost"}
                                        onClick={() => setQuickFilter("ready_for_pickup")}
                                    >
                                        Listos para retirar
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
                                </div>
                            </div>

                            <div className={styles.searchWrap}>
                                <Input
                                    label="Buscar"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Pedido, email o tel"
                                />
                            </div>

                            <div className={styles.filtersFooter}>
                                <div className={styles.filtersSummary}>
                                    Mostrando <b className={styles.strongText}>{filteredOrders.length}</b> de{" "}
                                    <b className={styles.strongText}>{orders.length}</b> pedido(s)
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={clearFilters}
                                    className={styles.clearBtn}
                                >
                                    Limpiar
                                </Button>
                            </div>
                        </Card>

                        {loading ? (
                            <Card className={styles.stateCard}>
                                <p className={styles.stateText}>Cargando pedidos...</p>
                            </Card>
                        ) : filteredOrders.length === 0 ? (
                            <Card className={styles.stateCard}>
                                <p className={styles.stateText}>
                                    No hay pedidos que coincidan con la vista actual.
                                </p>
                            </Card>
                        ) : (
                            <div className={styles.ordersList}>
                                {filteredOrders.map((order) => {
                                    const isSelected = selectedId === order.id;
                                    const isWorking = workingId === order.id;
                                    const displayPaymentStatus = getDisplayPaymentStatus(order.status);

                                    return (
                                        <Card
                                            key={order.id}
                                            className={`${styles.orderCard} ${
                                                isSelected ? styles.orderCardSelected : ""
                                            }`}
                                        >
                                            <div className={styles.orderTop}>
                                                <div className={styles.orderTopInfo}>
                                                    <div className={styles.orderCode}>
                                                        Pedido <b className={styles.strongText}>#{order.id}</b>
                                                    </div>
                                                    <div className={styles.orderFamily}>
                                                        {getFamilyLabel(order)}
                                                    </div>
                                                    <div className={styles.orderDate}>
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </div>

                                                <div className={styles.orderTotalBox}>
                                                    <div className={styles.orderTotalLabel}>Total</div>
                                                    <div className={styles.orderTotal}>
                                                        ${formatMoney(order.total)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.badgesRow}>
                                                <Badge
                                                    variant={
                                                        PAYMENT_STATUS_BADGE[displayPaymentStatus] || "lavender"
                                                    }
                                                >
                                                    {PAYMENT_STATUS_LABELS[displayPaymentStatus] ||
                                                        displayPaymentStatus}
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

                                            <div className={styles.itemsCount}>
                                                {Array.isArray(order.items) ? order.items.length : 0} producto(s)
                                            </div>

                                            <div className={styles.actionsRow}>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => loadOrderDetail(order.id)}
                                                    disabled={loadingDetail && isSelected}
                                                >
                                                    Ver detalle
                                                </Button>

                                                {getDisplayPaymentStatus(order?.status) === "paid" &&
                                                order?.deliveryStatus === "pending_delivery" ? (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => askReadyForPickup(order)}
                                                        disabled={isWorking}
                                                    >
                                                        Listo para retirar y avisar
                                                    </Button>
                                                ) : null}

                                                {canMarkDelivered(order) ? (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => askDeliveryStatus(order, "delivered")}
                                                        disabled={isWorking}
                                                    >
                                                        Marcar entregado
                                                    </Button>
                                                ) : null}

                                                {canMarkPendingDelivery(order) ? (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => askDeliveryStatus(order, "pending_delivery")}
                                                        disabled={isWorking}
                                                    >
                                                        Volver a pendiente
                                                    </Button>
                                                ) : null}

                                                {canCancelOrder(order) ? (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => askCancelOrder(order)}
                                                        disabled={isWorking}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                ) : null}
                                            </div>

                                            <div className={styles.paymentActions}>
                                                {canChangePaymentStatus(order, "pending_payment") ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => askPaymentStatus(order, "pending_payment")}
                                                        disabled={isWorking}
                                                    >
                                                        Pasar a pendiente
                                                    </Button>
                                                ) : null}

                                                {canChangePaymentStatus(order, "paid") ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => askPaymentStatus(order, "paid")}
                                                        disabled={isWorking}
                                                    >
                                                        Marcar pagado
                                                    </Button>
                                                ) : null}

                                                {canChangePaymentStatus(order, "expired") ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => askPaymentStatus(order, "expired")}
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
                        )}
                    </>
                ) : (
                    <Card className={`${styles.detailCard} ${styles.mobileDetailCard}`}>
                        <div className={styles.mobileDetailTop}>
                            <Button
                                variant="ghost"
                                onClick={closeMobileDetail}
                                className={styles.backBtn}
                            >
                                ← Volver al listado
                            </Button>
                        </div>

                        {loadingDetail ? (
                            <p className={styles.detailMuted}>Cargando detalle...</p>
                        ) : !selectedOrder ? (
                            <p className={styles.detailMuted}>No se pudo cargar el detalle del pedido.</p>
                        ) : (
                            <OrderDetailContent order={selectedOrder} />
                        )}
                    </Card>
                )}
            </div>

            <div className={styles.desktopOnly}>
                <div className={styles.dashboard}>
                    <Card
                        className={`${styles.metricCard} ${
                            quickFilter === "pending_payment" ? styles.metricCardActive : ""
                        }`}
                        onClick={() => setQuickFilter("pending_payment")}
                    >
                        <div className={styles.metricLabel}>Pendientes de pago</div>
                        <div className={styles.metricValue}>{counters.pendingPayment}</div>
                    </Card>

                    <Card
                        className={`${styles.metricCard} ${
                            quickFilter === "pending_delivery" ? styles.metricCardActive : ""
                        }`}
                        onClick={() => setQuickFilter("pending_delivery")}
                    >
                        <div className={styles.metricLabel}>Pendientes de entrega</div>
                        <div className={styles.metricValue}>{counters.pendingDelivery}</div>
                    </Card>

                    <Card
                        className={`${styles.metricCard} ${
                            quickFilter === "ready_for_pickup" ? styles.metricCardActive : ""
                        }`}
                        onClick={() => setQuickFilter("ready_for_pickup")}
                    >
                        <div className={styles.metricLabel}>Listos para retirar</div>
                        <div className={styles.metricValue}>{counters.readyForPickup}</div>
                    </Card>

                    <Card
                        className={`${styles.metricCard} ${
                            quickFilter === "delivered" ? styles.metricCardActive : ""
                        }`}
                        onClick={() => setQuickFilter("delivered")}
                    >
                        <div className={styles.metricLabel}>Entregados</div>
                        <div className={styles.metricValue}>{counters.delivered}</div>
                    </Card>

                    <Card
                        className={`${styles.metricCard} ${
                            quickFilter === "cancelled" ? styles.metricCardActive : ""
                        }`}
                        onClick={() => setQuickFilter("cancelled")}
                    >
                        <div className={styles.metricLabel}>Cancelados</div>
                        <div className={styles.metricValue}>{counters.cancelled}</div>
                    </Card>
                </div>

                <Card className={styles.filtersCard}>
                    <div className={styles.filtersGrid}>
                        <div className={styles.filterButtons}>
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
                                variant={quickFilter === "ready_for_pickup" ? "primary" : "ghost"}
                                onClick={() => setQuickFilter("ready_for_pickup")}
                            >
                                Listos para retirar
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
                        </div>
                    </div>

                    <div className={styles.searchWrap}>
                        <Input
                            label="Buscar"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pedido, email o tel"
                        />
                    </div>

                    <div className={styles.filtersFooter}>
                        <div className={styles.filtersSummary}>
                            Mostrando <b className={styles.strongText}>{filteredOrders.length}</b> de{" "}
                            <b className={styles.strongText}>{orders.length}</b> pedido(s)
                        </div>

                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className={styles.clearBtn}
                        >
                            Limpiar
                        </Button>
                    </div>
                </Card>

                {loading ? (
                    <Card className={styles.stateCard}>
                        <p className={styles.stateText}>Cargando pedidos...</p>
                    </Card>
                ) : filteredOrders.length === 0 ? (
                    <Card className={styles.stateCard}>
                        <p className={styles.stateText}>
                            No hay pedidos que coincidan con la vista actual.
                        </p>
                    </Card>
                ) : (
                    <div className={styles.contentGrid}>
                        <div className={styles.ordersList}>
                            {filteredOrders.map((order) => {
                                const isSelected = selectedId === order.id;
                                const isWorking = workingId === order.id;
                                const displayPaymentStatus = getDisplayPaymentStatus(order.status);

                                return (
                                    <Card
                                        key={order.id}
                                        className={`${styles.orderCard} ${
                                            isSelected ? styles.orderCardSelected : ""
                                        }`}
                                    >
                                        <div className={styles.orderTop}>
                                            <div className={styles.orderTopInfo}>
                                                <div className={styles.orderCode}>
                                                    Pedido <b className={styles.strongText}>#{order.id}</b>
                                                </div>
                                                <div className={styles.orderFamily}>
                                                    {getFamilyLabel(order)}
                                                </div>
                                                <div className={styles.orderDate}>
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </div>

                                            <div className={styles.orderTotalBox}>
                                                <div className={styles.orderTotalLabel}>Total</div>
                                                <div className={styles.orderTotal}>
                                                    ${formatMoney(order.total)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.badgesRow}>
                                            <Badge
                                                variant={
                                                    PAYMENT_STATUS_BADGE[displayPaymentStatus] || "lavender"
                                                }
                                            >
                                                {PAYMENT_STATUS_LABELS[displayPaymentStatus] ||
                                                    displayPaymentStatus}
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

                                        <div className={styles.itemsCount}>
                                            {Array.isArray(order.items) ? order.items.length : 0} producto(s)
                                        </div>

                                        <div className={styles.actionsRow}>
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

                                            {getDisplayPaymentStatus(order?.status) === "paid" &&
                                            order?.deliveryStatus === "pending_delivery" ? (
                                                <Button
                                                    variant="primary"
                                                    onClick={() => askReadyForPickup(order)}
                                                    disabled={isWorking}
                                                >
                                                    Listo para retirar y avisar
                                                </Button>
                                            ) : null}

                                            {canMarkDelivered(order) ? (
                                                <Button
                                                    variant="primary"
                                                    onClick={() => askDeliveryStatus(order, "delivered")}
                                                    disabled={isWorking}
                                                >
                                                    Marcar entregado
                                                </Button>
                                            ) : null}

                                            {canMarkPendingDelivery(order) ? (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => askDeliveryStatus(order, "pending_delivery")}
                                                    disabled={isWorking}
                                                >
                                                    Volver a pendiente
                                                </Button>
                                            ) : null}

                                            {canCancelOrder(order) ? (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => askCancelOrder(order)}
                                                    disabled={isWorking}
                                                >
                                                    Cancelar
                                                </Button>
                                            ) : null}
                                        </div>

                                        <div className={styles.paymentActions}>
                                            {canChangePaymentStatus(order, "pending_payment") ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => askPaymentStatus(order, "pending_payment")}
                                                    disabled={isWorking}
                                                >
                                                    Pasar a pendiente
                                                </Button>
                                            ) : null}

                                            {canChangePaymentStatus(order, "paid") ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => askPaymentStatus(order, "paid")}
                                                    disabled={isWorking}
                                                >
                                                    Marcar pagado
                                                </Button>
                                            ) : null}

                                            {canChangePaymentStatus(order, "expired") ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => askPaymentStatus(order, "expired")}
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

                        <Card className={styles.detailCard}>
                            {!selectedId ? (
                                <div className={styles.emptyDetail}>
                                    <div className={styles.detailTitle}>Detalle del pedido</div>
                                    <p className={styles.detailMuted}>
                                        Seleccioná un pedido para ver la información completa.
                                    </p>
                                </div>
                            ) : loadingDetail ? (
                                <p className={styles.detailMuted}>Cargando detalle...</p>
                            ) : !selectedOrder ? (
                                <p className={styles.detailMuted}>
                                    No se pudo cargar el detalle del pedido.
                                </p>
                            ) : (
                                <OrderDetailContent order={selectedOrder} />
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {confirmState ? (
                <div
                    className={styles.modalOverlay}
                    onClick={closeConfirm}
                    role="presentation"
                >
                    <div
                        className={styles.modalCard}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-order-action-title"
                    >
                        <div className={styles.modalBadgeWrap}>
                            <Badge variant={confirmState.tone === "danger" ? "orange" : "lavender"}>
                                Confirmación
                            </Badge>
                        </div>

                        <div className={styles.modalHead}>
                            <h3 id="confirm-order-action-title" className={styles.modalTitle}>
                                {confirmState.title}
                            </h3>

                            <p className={styles.modalText}>{confirmState.message}</p>

                            <p className={styles.modalText}>
                                Familia:{" "}
                                <b className={styles.strongText}>
                                    {getFamilyLabel(confirmState.order)}
                                </b>
                            </p>
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                variant="ghost"
                                onClick={closeConfirm}
                                disabled={Boolean(workingId)}
                                className={styles.modalCancelBtn}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant={confirmState.tone === "danger" ? "ghost" : "primary"}
                                onClick={onConfirmAction}
                                disabled={Boolean(workingId)}
                                className={
                                    confirmState.tone === "danger"
                                        ? styles.modalDangerBtn
                                        : styles.modalConfirmBtn
                                }
                            >
                                {workingId ? "Procesando..." : confirmState.confirmLabel}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}