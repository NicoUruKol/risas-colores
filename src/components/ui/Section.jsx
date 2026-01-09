export default function Section({
    title,
    subtitle,
    children,
    className = "",
    }) {
    return (
        <section className={`grid gap-4 ${className}`}>
            {(title || subtitle) && (
                <header className="grid gap-1">
                {title && (
                    <h2 className="text-xl font-extrabold text-ui-text">
                    {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="text-sm text-ui-muted">
                    {subtitle}
                    </p>
                )}
                </header>
            )}

            {children}
        </section>
    );
}
