import { useState } from "react";
import styles from "./CookieBanner.module.css";

export const CONSENT_KEY = "cookies-consent";
export const CONSENT_ACCEPTED = "accepted";
export const CONSENT_NECESSARY = "necessary";
export const CONSENT_REJECTED = "rejected";

export default function CookieBanner() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === "undefined") return false;
        return !localStorage.getItem(CONSENT_KEY);
    });

    const saveConsent = (value) => {
        localStorage.setItem(CONSENT_KEY, value);
        window.dispatchEvent(new Event("cookie-consent-changed"));
        setVisible(false);
    };

    const acceptAll = () => saveConsent(CONSENT_ACCEPTED);
    const acceptNecessary = () => saveConsent(CONSENT_NECESSARY);
    const rejectCookies = () => saveConsent(CONSENT_REJECTED);

    if (!visible) return null;

    return (
        <div
        className={styles.banner}
        role="dialog"
        aria-live="polite"
        aria-label="Preferencias de cookies"
        >
        <p className={styles.text}>
            Usamos cookies necesarias para que el sitio funcione correctamente y,
            si lo aceptás, cookies analíticas para mejorar la experiencia de las
            familias que nos visitan.
        </p>

        <div className={styles.actions}>
            <button
                onClick={rejectCookies}
                className={`${styles.btn} ${styles.reject}`}
                type="button"
                >
                Rechazar
            </button>

            <button
                onClick={acceptNecessary}
                className={`${styles.btn} ${styles.necessary}`}
                type="button"
                >
                Solo necesarias
            </button>

            <button
                onClick={acceptAll}
                className={`${styles.btn} ${styles.accept}`}
                type="button"
                >
                Aceptar todas
            </button>
        </div>
        </div>
    );
}