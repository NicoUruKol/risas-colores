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

function clampText(text = "", max = 160) {
    const t = String(text || "").trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max).trim()}…`;
}

/* ==============================
Breakpoint helper (>=1024)
============================== */
function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window !== "undefined"
        ? window.matchMedia("(min-width: 1024px)").matches
        : false
    );

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const onChange = () => setIsDesktop(mq.matches);

        onChange();
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    return isDesktop;
}

export default function ReviewsSection({
    title = "Lo que dicen las familias",
    subtitle = "Reseñas reales en Google",
    badge = "Google Maps",
    googleReviewsUrl = "https://maps.app.goo.gl/BtGnwQnfJ2pBCWco8?g_st=iw",
    buttonText = "Ver más reseñas",
    limit = 4,
    reviews = [],
    }) {
    const items = useMemo(() => {
        const arr = Array.isArray(reviews) ? reviews : [];
        return arr.slice(0, limit);
    }, [reviews, limit]);

    const DEFAULT_URL = "https://maps.app.goo.gl/BtGnwQnfJ2pBCWco8?g_st=iw";
    const link = String(googleReviewsUrl || "").trim() || DEFAULT_URL;

    const isDesktop = useIsDesktop();
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));
    const close = () => setOpenId(null);

    /* ESC para cerrar */
    useEffect(() => {
        const onKey = (e) => {
        if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* Lock scroll SOLO en desktop cuando está abierto */
    useEffect(() => {
        if (!isDesktop) return;
        if (!openId) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
        document.body.style.overflow = prev;
        };
    }, [openId, isDesktop]);

    const anyOpen = Boolean(openId);

    return (
        <section className={styles.section} aria-label="Reseñas de Google">
        {/* Backdrop full-screen (desktop). Click afuera = close */}
        {anyOpen && isDesktop ? (
            <button
            type="button"
            className={styles.backdrop}
            onClick={close}
            aria-label="Cerrar reseña"
            />
        ) : null}

        <div className={styles.head}>
            <div className={styles.headLeft}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
            </div>

            <div className={styles.headRight}>
            <Badge variant="blue">{badge}</Badge>
            </div>
        </div>

        <div className={`${styles.grid} ${anyOpen ? styles.gridDim : ""}`}>
            {items.map((r, idx) => {
            const displayName = String(r.authorName ?? r.name ?? "").trim();
            const when = String(r.relativeTime ?? r.when ?? "").trim();
            const photo = String(r.authorPhotoUrl ?? r.photoUrl ?? "").trim();
            const initial = (displayName || "?").slice(0, 1).toUpperCase();

            const isOpen = openId === r.id;

            // Desktop: 4 cols -> panel a izquierda para col 3 y 4
            const col = idx % 4;
            const sideDir = col >= 2 ? styles.sideLeft : styles.sideRight;

            return (
                <div key={r.id} className={styles.cardWrap}>
                {/* Card base */}
                <Card
                    className={[
                    styles.card,
                    styles.softCard,
                    isOpen && isDesktop ? styles.baseHidden : "",
                    anyOpen && !isOpen ? styles.dimCard : "",
                    ].join(" ")}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={() => toggle(r.id)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(r.id);
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
                        {when ? <div className={styles.when}>{when}</div> : null}
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

                    {/* Inline expand SOLO móvil/tablet */}
                    {isOpen && !isDesktop ? (
                    <div
                        className={styles.inlineExpand}
                        role="region"
                        aria-label="Reseña completa"
                    >
                        <div className={styles.inlineTop}>
                        <div className={styles.inlineTitle}>Reseña completa</div>
                        </div>
                        <p className={styles.fullText}>
                        {String(r.text || "").trim()}
                        </p>
                    </div>
                    ) : null}
                </Card>

                {/* Side panel SOLO desktop */}
                {isOpen && isDesktop ? (
                    <div className={`${styles.sidePanel} ${sideDir}`} aria-label="Reseña completa">
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
                            <div className={styles.name} title={displayName}>
                                {displayName || "Sin nombre"}
                            </div>
                            <Stars value={r.rating} />
                            {when ? <div className={styles.when}>{when}</div> : null}
                            </div>
                        </div>

                        <div className={styles.closeHint} aria-hidden>
                            Click para cerrar
                        </div>
                        </div>

                        <p className={styles.fullText}>{String(r.text || "").trim()}</p>
                    </div>
                    </div>
                ) : null}
                </div>
            );
            })}
        </div>

        <div className={styles.footer}>
            <a className={styles.linkReset} href={link} target="_blank" rel="noreferrer">
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