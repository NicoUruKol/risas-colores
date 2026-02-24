import { useMemo } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import styles from "./ReviewsSection.module.css";

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

    return (
        <section className={styles.section} aria-label="Reseñas de Google">
        <div className={styles.head}>
            <div className={styles.headLeft}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
            </div>

            <div className={styles.headRight}>
            <Badge variant="blue">{badge}</Badge>
            </div>
        </div>

        <div className={styles.grid}>
            {items.map((r) => {
            const displayName = String(r.authorName ?? r.name ?? "").trim();
            const when = String(r.relativeTime ?? r.when ?? "").trim();
            const photo = String(r.authorPhotoUrl ?? r.photoUrl ?? "").trim();
            const initial = (displayName || "?").slice(0, 1).toUpperCase();

            return (
                <Card key={r.id} className={`${styles.card} ${styles.softCard}`}>
                <div className={styles.cardTop}>
                    <div className={styles.person}>
                    <div className={styles.avatar} aria-hidden>
                        {photo ? (
                        <img src={photo} alt="" className={styles.avatarImg} loading="lazy" />
                        ) : (
                        initial
                        )}
                    </div>

                    <div className={styles.personMeta}>
                        <div className={styles.name}>{displayName || "Sin nombre"}</div>
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
                </Card>
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