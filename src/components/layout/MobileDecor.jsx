import styles from "./MobileDecor.module.css";

export default function MobileDecor() {
    return (
        <div className={styles.stage} aria-hidden="true">
            {/* Arriba */}
            <div className={`${styles.bubble} ${styles.orange} ${styles.o1}`} />
            <div className={`${styles.bubble} ${styles.violet} ${styles.v1}`} />
            <div className={`${styles.bubble} ${styles.blue} ${styles.b1}`} />

            {/* Medio */}
            <div className={`${styles.bubble} ${styles.orange} ${styles.o2}`} />
            <div className={`${styles.bubble} ${styles.violet} ${styles.v2}`} />
            <div className={`${styles.bubble} ${styles.blue} ${styles.b2}`} />

            {/* Medio-bajo */}
            <div className={`${styles.bubble} ${styles.orange} ${styles.o3}`} />
            <div className={`${styles.bubble} ${styles.violet} ${styles.v3}`} />
            <div className={`${styles.bubble} ${styles.blue} ${styles.b3}`} />

            {/* Abajo */}
            <div className={`${styles.bubble} ${styles.orange} ${styles.o4}`} />
            <div className={`${styles.bubble} ${styles.violet} ${styles.v4}`} />
            <div className={`${styles.bubble} ${styles.blue} ${styles.b4}`} />
        </div>
    );
}


