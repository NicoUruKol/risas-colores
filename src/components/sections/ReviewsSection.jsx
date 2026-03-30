import { useMemo, useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import styles from "./ReviewsSection.module.css";

/* ==============================
Estrellas
============================== */
function Stars({ value = 5 }) {
    const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));

    return (
        <div className={styles.stars} aria-label={`${v} de 5 estrellas`}>
            {"★★★★★".slice(0, v)}
            <span className={styles.starsOff}>{"★★★★★".slice(0, 5 - v)}</span>
        </div>
    );
}

/* ==============================
Helpers
============================== */
function clampText(text = "", max = 160) {
    const t = String(text || "").trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max).trim()}…`;
}

/* ==============================
Componente
============================== */
export default function ReviewsSection({
    title = "Lo que dicen las familias",
    subtitle = "Reseñas reales en Google",
    badge = "Google Maps",
    googleReviewsUrl = "https://www.google.com.ar/maps/place/Risas+y+Colores/@-34.5909792,-58.5036159,18.5z/data=!4m8!3m7!1s0x95bcb64a22cf03c1:0x9c1ceb0a2afdd6ce!8m2!3d-34.5912437!4d-58.5036519!9m1!1b1!16s%2Fg%2F11b6g8vbs6?entry=ttu&g_ep=EgoyMDI2MDMxMC4wIKXMDSoASAFQAw%3D%3D",
    buttonText = "Ver más reseñas",
    limit = 4,
    reviews = [],
}) {
    const items = useMemo(() => {
        const arr = Array.isArray(reviews) ? reviews : [];
        return arr.slice(0, limit);
    }, [reviews, limit]);

    const DEFAULT_URL =
        "https://www.google.com.ar/maps/place/Risas+y+Colores/@-34.5909792,-58.5036159,18.5z/data=!4m8!3m7!1s0x95bcb64a22cf03c1:0x9c1ceb0a2afdd6ce!8m2!3d-34.5912437!4d-58.5036519!9m1!1b1!16s%2Fg%2F11b6g8vbs6?entry=ttu&g_ep=EgoyMDI2MDMxMC4wIKXMDSoASAFQAw%3D%3D";

    const link = String(googleReviewsUrl || "").trim() || DEFAULT_URL;

    const [openId, setOpenId] = useState(null);
    const anyOpen = Boolean(openId);

    const toggle = (id) => {
        setOpenId((current) => (current === id ? null : id));
    };

    const close = () => {
        setOpenId(null);
    };

    /* ==============================
    Tecla ESC
    ============================== */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") close();
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <section className={styles.section} aria-label="Reseñas de Google">
            {/* ==============================
            Backdrop
            ============================== */}
            {anyOpen ? (
                <button
                    type="button"
                    className={`${styles.backdrop} ${styles.onlyDesktop}`}
                    onClick={close}
                    aria-label="Cerrar reseña"
                />
            ) : null}

            {/* ==============================
            Header
            ============================== */}
            <div className={styles.head}>
                <div className={styles.headLeft}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.headRight}>
                    <Badge variant="blue">{badge}</Badge>
                </div>
            </div>

            {/* ==============================
            Grid
            ============================== */}
            <div className={`${styles.grid} ${anyOpen ? styles.gridDim : ""}`}>
                {items.map((r, idx) => {
                    const reviewId = r.id ?? `review-${idx}`;
                    const displayName = String(r.authorName ?? r.name ?? "").trim();
                    const when = String(r.relativeTime ?? r.when ?? "").trim();
                    const photo = String(r.authorPhotoUrl ?? r.photoUrl ?? "").trim();
                    const initial = (displayName || "?").slice(0, 1).toUpperCase();
                    const isOpen = openId === reviewId;

                    const col = idx % 4;
                    const sideDir = col >= 2 ? styles.sideLeft : styles.sideRight;

                    return (
                        <div key={reviewId} className={styles.cardWrap}>
                            {/* ==============================
                            Card base
                            ============================== */}
                            <Card
                                className={[
                                    styles.card,
                                    styles.softCard,
                                    isOpen ? styles.baseHiddenDesktop : "",
                                    anyOpen && !isOpen ? styles.dimCard : "",
                                ].join(" ")}
                                role="button"
                                tabIndex={0}
                                aria-expanded={isOpen}
                                onClick={() => toggle(reviewId)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggle(reviewId);
                                    }
                                }}
                            >
                                <div className={styles.cardTop}>
                                    <div className={styles.person}>
                                        <div className={styles.avatar} aria-hidden>
                                            {photo ? (
                                                <img
                                                    src={photo}
                                                    alt=""
                                                    className={styles.avatarImg}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                initial
                                            )}
                                        </div>

                                        <div className={styles.personMeta}>
                                            <div className={styles.name} title={displayName}>
                                                {displayName || "Sin nombre"}
                                            </div>
                                            <Stars value={r.rating} />
                                            {when ? (
                                                <div className={styles.when}>{when}</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className={styles.source} aria-label="Fuente Google">
                                        <span className={styles.gDot} aria-hidden />
                                        <span className={styles.sourceText}>Google</span>
                                    </div>
                                </div>

                                <p className={styles.text}>{clampText(r.text, 170)}</p>

                                <div className={styles.tapHint} aria-hidden>
                                    Tocá para leer completo
                                </div>

                                {/* ==============================
                                Expand inline
                                ============================== */}
                                {isOpen ? (
                                    <div
                                        className={`${styles.inlineExpand} ${styles.onlyMobile}`}
                                        role="region"
                                        aria-label="Reseña completa"
                                    >
                                        <div className={styles.inlineTop}>
                                            <div className={styles.inlineTitle}>
                                                Reseña completa
                                            </div>
                                        </div>

                                        <p className={styles.fullText}>
                                            {String(r.text || "").trim()}
                                        </p>
                                    </div>
                                ) : null}
                            </Card>

                            {/* ==============================
                            Side panel desktop
                            ============================== */}
                            {isOpen ? (
                                <div
                                    className={`${styles.sidePanel} ${sideDir} ${styles.onlyDesktop}`}
                                    aria-label="Reseña completa"
                                >
                                    <div
                                        className={`${styles.sideCard} ${styles.softCard} ${styles.sideCardVibe}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={close}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                close();
                                            }
                                        }}
                                        aria-label="Cerrar reseña"
                                    >
                                        <div className={styles.sideTop}>
                                            <div className={styles.person}>
                                                <div className={styles.avatar} aria-hidden>
                                                    {photo ? (
                                                        <img
                                                            src={photo}
                                                            alt=""
                                                            className={styles.avatarImg}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        initial
                                                    )}
                                                </div>

                                                <div className={styles.personMeta}>
                                                    <div
                                                        className={styles.name}
                                                        title={displayName}
                                                    >
                                                        {displayName || "Sin nombre"}
                                                    </div>
                                                    <Stars value={r.rating} />
                                                    {when ? (
                                                        <div className={styles.when}>{when}</div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className={styles.closeHint} aria-hidden>
                                                Click para cerrar
                                            </div>
                                        </div>

                                        <p className={styles.fullText}>
                                            {String(r.text || "").trim()}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {/* ==============================
            Footer
            ============================== */}
            <div className={styles.footer}>
                <a
                    className={styles.linkReset}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                >
                    <Button variant="ghost" className={styles.btnSmall}>
                        {buttonText}
                        <span className={styles.arrow} aria-hidden>
                            →
                        </span>
                    </Button>
                </a>

                <p className={styles.disclaimer}>*Ir a Google Maps reseñas.</p>
            </div>
        </section>
    );
}