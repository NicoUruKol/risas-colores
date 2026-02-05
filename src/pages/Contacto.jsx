import { useMemo, useState } from "react";
import Container from "../components/layout/Container";
import styles from "./Contacto.module.css";
import SEO from "../components/seo/SEO";


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contacto() {
    const FORM_ENDPOINT = "https://formspree.io/f/XXXXXXXX"; // <-- tu id

    const [status, setStatus] = useState("idle"); // idle | sending | sent | error
    const [errors, setErrors] = useState({});

    const initial = useMemo(
        () => ({ nombre: "", email: "", telefono: "", motivo: "Consulta", mensaje: "" }),
        []
    );
    const [data, setData] = useState(initial);

    const onChange = (e) => {
        const { name, value } = e.target;
        setData((d) => ({ ...d, [name]: value }));
    };

    const validate = () => {
        const next = {};
        if (!data.nombre.trim()) next.nombre = "Ingresá tu nombre.";
        if (!data.email.trim()) next.email = "Ingresá tu email.";
        else if (!EMAIL_RE.test(data.email)) next.email = "Email inválido.";
        if (!data.mensaje.trim() || data.mensaje.trim().length < 10)
        next.mensaje = "Contanos un poco más (mínimo 10 caracteres).";
        return next;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        try {
        setStatus("sending");

        const res = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
            nombre: data.nombre,
            email: data.email,
            telefono: data.telefono,
            motivo: data.motivo,
            mensaje: data.mensaje,
            page: window.location.href,
            }),
        });

        if (!res.ok) throw new Error("Bad response");

        setStatus("sent");
        setData(initial);
        setErrors({});
        } catch {
        setStatus("error");
        }
    };

    return (
        <main className={styles.page}>
            <SEO
            title="Contacto"
            description="Contactanos para conocer más sobre el Jardín Maternal Risas y Colores. Estamos para acompañarte y responder tus dudas."
            path="/contacto"
            />

        <Container className={styles.inner}>
            <header className={styles.header}>
            <h1 className={styles.title}>Contacto</h1>
            <p className={styles.subtitle}>
                Dejanos tu consulta y te respondemos a la brevedad.
            </p>
            </header>

            <section className={styles.card}>
            {status === "sent" && (
                <div className={styles.noticeOk} role="status">
                ¡Listo! Recibimos tu mensaje. Te respondemos pronto 💛
                </div>
            )}
            {status === "error" && (
                <div className={styles.noticeErr} role="alert">
                Uy, no pudimos enviar el mensaje. Probá de nuevo en un ratito.
                </div>
            )}

            <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.grid2}>
                    <label className={styles.field}>
                        <span className={styles.label}>Nombre *</span>
                        <input
                            name="nombre"
                            value={data.nombre}
                            onChange={onChange}
                            className={styles.input}
                            placeholder="Tu nombre"
                            autoComplete="name"
                        />
                        {errors.nombre && <span className={styles.err}>{errors.nombre}</span>}
                    </label>

                <label className={styles.field}>
                    <span className={styles.label}>Email *</span>
                    <input
                        name="email"
                        value={data.email}
                        onChange={onChange}
                        className={styles.input}
                        placeholder="tuemail@ejemplo.com"
                        autoComplete="email"
                    />
                    {errors.email && <span className={styles.err}>{errors.email}</span>}
                </label>
                </div>

                <div className={styles.grid2}>
                    <label className={styles.field}>
                        <span className={styles.label}>Teléfono (opcional)</span>
                        <input
                        name="telefono"
                        value={data.telefono}
                        onChange={onChange}
                        className={styles.input}
                        placeholder="Ej: 11 1234 5678"
                        autoComplete="tel"
                        />
                    </label>

                <label className={styles.field}>
                    <span className={styles.label}>Motivo</span>
                    <select
                        name="motivo"
                        value={data.motivo}
                        onChange={onChange}
                        className={styles.input}
                    >
                    <option>Consulta</option>
                    <option>Inscripción</option>
                    <option>Uniformes</option>
                    <option>Horarios</option>
                    <option>Otro</option>
                    </select>
                </label>
                </div>

                <label className={styles.field}>
                    <span className={styles.label}>Mensaje *</span>
                    <textarea
                        name="mensaje"
                        value={data.mensaje}
                        onChange={onChange}
                        className={styles.textarea}
                        placeholder="Escribí tu consulta..."
                        rows={6}
                    />
                    {errors.mensaje && <span className={styles.err}>{errors.mensaje}</span>}
                </label>

                {/* Honeypot anti-spam (invisible) */}
                    <input
                    type="text"
                    name="_gotcha"
                    tabIndex="-1"
                    autoComplete="off"
                    className={styles.gotcha}
                    />

                <div className={styles.actions}>
                    <button
                        className={styles.btn}
                        type="submit"
                        disabled={status === "sending"}
                    >
                        {status === "sending" ? "Enviando..." : "Enviar consulta"}
                        <span className={styles.arrow}>→</span>
                    </button>

                    <a
                    className={styles.alt}
                    href="https://wa.me/5491152499974?text=Hola%20%F0%9F%91%A6%F0%9F%8F%BB%20%F0%9F%91%A7%F0%9F%8F%BB%20%F0%9F%8C%88%0ASomos%20una%20familia%20interesada%20en%20conocer%20m%C3%A1s%20sobre%20el%20Jard%C3%ADn%20Maternal%20Risas%20y%20Colores.%0A%C2%BFPodemos%20coordinar%20una%20visita%20o%20recibir%20m%C3%A1s%20informaci%C3%B3n%3F%0A%0A%C2%A1Gracias!"
                    target="_blank"
                    rel="noreferrer"
                    >
                    O escribir por WhatsApp
                    </a>
                </div>
            </form>
            </section>
        </Container>
        </main>
    );
}
