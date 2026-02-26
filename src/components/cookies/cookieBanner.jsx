import { useState } from "react";
import styles from "./CookieBanner.module.css";

const CONSENT_KEY = "cookies-consent";

export default function CookieBanner() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === "undefined") return false;
        return !localStorage.getItem(CONSENT_KEY);
    });

    const acceptCookies = () => {
        localStorage.setItem(CONSENT_KEY, "1");
        setVisible(false);
    };

    const rejectCookies = () => {
        localStorage.setItem(CONSENT_KEY, "rejected");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className={styles.banner} role="dialog" aria-live="polite">
        <p className={styles.text}>
            Usamos cookies para mejorar la experiencia en nuestro sitio y acompañar mejor a las familias que nos visitan.
        </p>

        <div className={styles.actions}>
            <button onClick={rejectCookies} className={`${styles.btn} ${styles.reject}`}>
            Rechazar
            </button>

            <button onClick={acceptCookies} className={`${styles.btn} ${styles.accept}`}>
            Aceptar
            </button>
        </div>
        </div>
    );
}