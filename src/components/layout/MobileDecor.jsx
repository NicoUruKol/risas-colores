import styles from "./MobileDecor.module.css";

export default function MobileDecor() {
    return (
        <div className={styles.wrap} aria-hidden="true">
        <span className={`${styles.blob} ${styles.orange}`} />
        <span className={`${styles.blob} ${styles.violet}`} />
        <span className={`${styles.blob} ${styles.blue}`} />
        <span className={styles.grain} />
        </div>
    );
}
